from django.contrib import admin

# Register your models here.
from opd_use_of_force.apps.useofforce.models import Incident

class IncidentAdmin(admin.ModelAdmin):
    date_hierarchy = 'date'
    search_fields = ['date', 'address', 'city','zipcode',]
    list_display = ('date', 'address', 'city', 'state', 'zipcode', 'latitude', 'longitude','accuracy_score',)
    list_filter = ('year', 'city', 'accuracy_score',)

admin.site.register(Incident, IncidentAdmin)
