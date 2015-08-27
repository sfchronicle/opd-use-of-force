from bakery.views import BuildableTemplateView
from django.db.models import Q
from opd_use_of_force.apps.useofforce.models import Incident


class IncidentListView(BuildableTemplateView):
    template_name = 'incident_map.html'

    def get_context_data(self, **kwargs ):
        context = super(IncidentListView, self).get_context_data(**kwargs)
        context['incidents'] = Incident.objects.filter(
            Q(city='Oakland'),
            Q(date__range=['2006-01-01', '2015-12-31'])
        )
        return context
