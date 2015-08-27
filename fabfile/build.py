from fabric.api import local, task


@task
def bower(command, args='', option=''):
    """
    usage: fab bower:<command>, <args>, <option>

    Execute bower commands.

    See 'fab bower:help' for more information
    """
    local('cd opd_use_of_force && bower {0} {1} {2}'.format(
        command,
        args,
        option
    ))


@task
def npm(command, args='', option=''):
    """
    usage: fab npm:<command>, <args>, <option>

    Execute npm commands

    See 'fab npm:help' for more information
    """
    local('cd opd_use_of_force && npm {0} {1} {2}'.format(
        command,
        option,
        args,
    ))


@task
def scaffold(skip_install=''):
    """
    Setup frontend management for Django project with yo, grunt and bower.
    See 'https://github.com/cirlabs/generator-newsapp' for more information.

    Skip installing npm modules by running fab scaffold:skip-install
    """
    if skip_install != 'skip-install':
        npm('install', 'yo', '-g')
        npm('install', 'generator-newsapp', '-g')

    local('cd opd_use_of_force && yo newsapp')
