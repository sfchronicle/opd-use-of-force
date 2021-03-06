from bakery.views import BuildableTemplateView
from django.db.models import Q
from opd_use_of_force.apps.useofforce.models import Incident


class IncidentListView(BuildableTemplateView):
    template_name = 'incident_map.html'
    build_path = 'index.html'

    def get_context_data(self, **kwargs ):
        context = super(IncidentListView, self).get_context_data(**kwargs)
        context['incidents'] = Incident.objects.filter(
            date__range=['2007-01-01', '2015-12-31'])
        return context
