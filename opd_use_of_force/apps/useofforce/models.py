from django.contrib.gis.db import models

class Incident(models.Model):
    date = models.DateTimeField(null=True)
    year = models.CharField(max_length=4, null=True)

    raw_location = models.CharField(max_length=255, null=True)
    address = models.CharField(max_length=255, null=True)
    city_and_state = models.CharField(max_length=255, null=True)
    full_address = models.CharField(max_length=255, null=True)

    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    accuracy_score = models.FloatField(null=True)
    accuracy_type = models.CharField(max_length=255, null=True)

    number = models.CharField(max_length=255, null=True)  # CharField to prevent errors streets like 42 N Main St.
    street = models.CharField(max_length=255, null=True)

    city = models.CharField(max_length=255, null=True)
    state = models.CharField(max_length=255, null=True)

    county = models.CharField(max_length=255, null=True)

    zipcode = models.IntegerField(null=True)

    def __unicode__(self):
        return "{} {}".format(self.date, self.full_address)
