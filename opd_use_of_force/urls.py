from django.contrib import admin
from django.conf.urls import patterns, include, url

from opd_use_of_force.apps.useofforce import views

admin.autodiscover()

urlpatterns = patterns('',
    # Admin
    (r'^admin/', admin.site.urls),
    (r'^$', views.IncidentListView.as_view()),
)
