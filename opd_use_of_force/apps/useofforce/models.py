from django.contrib.gis.db import models

class Incident(models.Model):
    date = models.DateTimeField(null=True, db_index=True)
    year = models.CharField(max_length=4, null=True, db_index=True)

    raw_location = models.CharField(max_length=255, null=True, db_index=True)
    address = models.CharField(max_length=255, null=True, db_index=True)
    city_and_state = models.CharField(max_length=255, null=True, db_index=True)
    full_address = models.CharField(max_length=255, null=True, db_index=True)

    latitude = models.FloatField(null=True, db_index=True)
    longitude = models.FloatField(null=True, db_index=True)

    accuracy_score = models.FloatField(null=True, db_index=True)
    accuracy_type = models.CharField(max_length=255, null=True, db_index=True)

    number = models.CharField(max_length=255, null=True, db_index=True)  # CharField to prevent errors streets like 42 N Main St.
    street = models.CharField(max_length=255, null=True, db_index=True)

    city = models.CharField(max_length=255, null=True, db_index=True)
    state = models.CharField(max_length=255, null=True, db_index=True)

    county = models.CharField(max_length=255, null=True, db_index=True)

    zipcode = models.IntegerField(null=True, db_index=True)

    def __unicode__(self):
        return "{} {}".format(self.date, self.full_address)
