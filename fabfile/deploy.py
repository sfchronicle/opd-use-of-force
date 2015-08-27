import os
import sys

from lib.utils import log
from .other import log_success

try:
    import boto
    from boto.s3.key import Key
except ImportError:
    log("Remember to install boto before deploying", "red")

from fabric.api import *
from fabric.contrib import django

django.settings_module("opd_use_of_force.settings")
from django.conf import settings

from opd_use_of_force.settings.production import (
    AWS_BUCKET_NAME,
    AWS_MEDIA_BUCKET_NAME,
    AWS_STAGING_BUCKET_NAME,
    VERBOSE_APP_NAME,
    BUILD_DIR
)

"""
Deployment Tasks
================
"""

project_name = "opd_use_of_force"
pwd = os.path.dirname(__file__)
gzip_path = '{0}/{1}/gzip/static/'.format(pwd, project_name)
static_path = '{0}/{1}/static/'.format(pwd, project_name)

try:
    s3 = boto.connect_s3(
        settings.AWS_ACCESS_KEY_ID,
        settings.AWS_SECRET_ACCESS_KEY
    )
    s3_bucket = s3.get_bucket(AWS_BUCKET_NAME)
    s3_media_bucket = s3.get_bucket(AWS_MEDIA_BUCKET_NAME)
    s3_staging_bucket = s3.get_bucket(AWS_STAGING_BUCKET_NAME)

except AttributeError:
    log("Yo! Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to ")
    log("settings/local_settings.py before deploying\n")

except NameError:
    """
    `fab bootstrap` will fail because boto will not be defined when it runs
    therefore we catch the NameError here to make sure fabric can run
    when the project begins bootstrapping.
    """
    pass

except IOError:
    pass


@task
def gzip_assets():
    """
    GZIP files in the static directory and places files in the gzip directory.
    """
    local("cd {0}; python ./lib/gzip_assets.py".format(pwd))


@task
def grunt_build():
    """
    Execute grunt build for any cleanup that needs to happen before deploying.
    """
    local('cd opd_use_of_force && grunt build')


@task
def deploy_to_s3(bucket='staging'):
    """
    Deploy `build` directory to specified S3 bucket. Defaults to 'staging'.
    """
    # See: https://gist.github.com/SavvyGuard/6115006

    def percent_cb(complete, total):
        sys.stdout.write('.')
        sys.stdout.flush()

    # max size in bytes for uploading in parts. between 1 and 5 GB recommended
    MAX_SIZE = 20 * 1000 * 1000

    # size of parts when uploading in parts
    PART_SIZE = 6 * 1000 * 1000

    # paths
    dest_dir = VERBOSE_APP_NAME

    app_directory = BUILD_DIR

    source_dir = settings.STATIC_ROOT

    upload_file_names = []
    app_directory_file_names = []

    # Grab files
    for dir_, _, files in os.walk(source_dir):
        for filename in files:
            relative_directory = os.path.relpath(dir_, source_dir)
            relative_file = os.path.join(relative_directory, filename)

            upload_file_names.append(relative_file)

    for (app_directory, dirname, filename) in os.walk(app_directory):
        app_directory_file_names.extend(filename)

    # Upload static media
    for filename in upload_file_names:
        source_path = os.path.join(settings.STATIC_ROOT, filename)
        dest_path = os.path.join(dest_dir, filename)

        log(
            "\n  Uploading {0} to bucket {1}\n".format(
                source_path, AWS_MEDIA_BUCKET_NAME
            )
        )

        filesize = os.path.getsize(source_path)

        if filesize > MAX_SIZE:
            log("    Large file. Running multipart upload")
            mp = s3_media_bucket
            fp = open(source_path, 'rb')
            fp_num = 0
            while (fp.tell() < filesize):
                fp_num += 1
                log("\n      uploading part %i" % fp_num)
                mp.upload_part_from_file(
                    fp, fp_num, cb=percent_cb, num_cb=10, size=PART_SIZE)

                mp.complete_upload()

        else:
            log("\n    Running upload\n")
            k = Key(s3_media_bucket)
            k.key = dest_path
            k.set_contents_from_filename(source_path, cb=percent_cb, num_cb=10)
            k.make_public()

    # Upload build files
    for filename in app_directory_file_names:
        source_path = os.path.join(BUILD_DIR, filename)
        dest_path = os.path.join(dest_dir, filename)

        if bucket == 'staging':
            k = Key(s3_staging_bucket)
        elif bucket == 'production':
            k = Key(s3_bucket)
        else:
            log("Specify `staging` or `production`. Exiting ..", "red")
            sys.exit()

        k.key = dest_path
        k.set_contents_from_filename(source_path, cb=percent_cb, num_cb=10)
        k.make_public()

    # Celebrate when pushed to production
    log_success() if bucket == 'production' else ''


@task
def build():
    """shortcut for django bakery build command"""
    local('python manage.py build \
        --skip-static --settings=opd_use_of_force.settings.production')


@task
def unbuild():
    """shortcut for django bakery unbuild command"""
    local('python manage.py unbuild \
        --settings=opd_use_of_force.settings.production')


@task
def compress():
    """shortcut for django compressor offline compression command"""
    local('python manage.py compress \
        --settings=opd_use_of_force.settings.production')


@task
def reset():
    """delete all the deploy code"""
    local('cd opd_use_of_force && \
        rm -rf static && rm -rf gzip && rm -rf build')


@task
def invalidate_buildpath():
    """Invalidate Cloudfront cache when pushed to production"""
    raise NotImplementedError


@task()
def publish(bucket='staging', dryrun='False'):
    """
    usage: fab publish:dryrun=[False | True], bucket=['staging' | 'production']

    DEFAULT: Compress, build and deploy project to staging bucket on Amazon S3.
    pass dryrun=False to skip publishing the assets to the
    """
    should_we_publish = True if dryrun == 'False' else False

    reset()
    compress()
    build()
    settings.USE_GRUNT and grunt_build()
    if should_we_publish:
        log('\nPublishing ...\n')
        deploy_to_s3(bucket)
    else:
        log('\nBuild is complete but no assets were published to AWS S3\n')
