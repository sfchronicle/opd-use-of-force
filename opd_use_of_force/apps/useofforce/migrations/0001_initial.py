# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Incident',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateTimeField(null=True)),
                ('year', models.CharField(max_length=4, null=True)),
                ('raw_location', models.CharField(max_length=255, null=True)),
                ('address', models.CharField(max_length=255, null=True)),
                ('city_and_state', models.CharField(max_length=255, null=True)),
                ('full_address', models.CharField(max_length=255, null=True)),
                ('latitude', models.FloatField(null=True)),
                ('longitude', models.FloatField(null=True)),
                ('accuracy_score', models.FloatField(null=True)),
                ('accuracy_type', models.CharField(max_length=255, null=True)),
                ('number', models.IntegerField(null=True)),
                ('street', models.CharField(max_length=255, null=True)),
                ('city', models.CharField(max_length=255, null=True)),
                ('state', models.CharField(max_length=255, null=True)),
                ('county', models.CharField(max_length=255, null=True)),
                ('zipcode', models.IntegerField(null=True)),
            ],
        ),
    ]
