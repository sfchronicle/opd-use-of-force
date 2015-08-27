import os

from django.conf import settings
from django.core.management.base import BaseCommand

from lib.utils import all_files, log
from postgres_copy import CopyMapping

from opd_use_of_force.apps.useofforce.models import Incident


class Command(BaseCommand):
    help = "Load OPD csv to useofforce.Incident"

    def handle(self, *args, **options):
        data = os.path.join(settings.BASE_DIR, 'data')
        files = list(all_files(data, '*.csv'))

        for filepath in files:
            log('Opening file {}\n'.format(filepath), 'cyan')

            log('  Loading data ...\n')

            copy = CopyMapping(
                Incident,
                filepath,
                dict(
                    date='IncidentDate',
                    year='Year',
                    raw_location='Location',
                    address='Edited Street Address',
                    city_and_state='City and State',
                    full_address='Edited Full Address',
                    latitude='Latitude',
                    longitude='Longitude',
                    accuracy_score='Accuracy Score',
                    accuracy_type='Accuracy Type',
                    number='Number',
                    street='Street',
                    city='City',
                    state='State',
                    county='County',
                    zipcode='Zip',
                )
            )

            copy.save()

            log('    Data loaded!\n', 'green')
