from bakery.views import BuildableListView, BuildableDetailView

from opd_use_of_force.apps.useofforce.models import Incident


class IncidentListView(BuildableListView):
    model = Incident
    context_object_name = 'incidents'
    template_name = 'incident_map.html' 
