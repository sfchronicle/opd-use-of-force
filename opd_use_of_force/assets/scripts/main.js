// jshint devel:true
'use strict';

// var incidents = [
//     {% for incident in incidents %}
//         {
//             'type': 'Feature',
//             'geometry': {
//                 'type': 'Point',
//                 'coordinates': [{{ incident.longitude }}, {{ incident.latitude }}]
//             },
//             'properties': {
//                 'address': '{{ incident.address }}',
//                 'date': '{{ incident.date }}',
//                 'year': '{{ incident.year }}',
//                 'city': '{{ incident.city }}',
//                 'state': '{{ incident.state }}',
//                 'zip': '{{ incident.zipcode }}'
//             }
//         },
//     {% endfor %}
// ];

function addCommas (val) {
    // Add comma to numbers
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

function updateMapLabel (yearRange, totalIncidents) {
    $('.year-range').text(yearRange);
    $('.total-incidents').text(addCommas(totalIncidents));
}

var App = App || {
    width: 1350,
    height: 600,
    coordinates: [-122.2708, 37.7990]
};

App.init = function () {
    var self = this;
    self.load();
    self.slider();
};

App.slider = function () {
    var self = this;
    updateMapLabel('2006-2015', incidents.length);

    $('#show-all-data').on('click', function (event) {
        event.preventDefault();
        self.svg.select('g.incidents').remove();
        $('#total-label').css('display', 'inline');

        self.renderJson(self.svg, incidents, 'incident');

        updateMapLabel('2006-2015', incidents.length);

    });

    $('.slider').slider({
        min: 2006,
        max: 2015,
        slide: function (event, ui) {
            self.svg.select('g.incidents').remove();
            var data = incidents.filter(function (incident) {
                return parseInt(incident[2].year) === ui.value;
            });

            $('#total-label').css('display', 'none');

            updateMapLabel(ui.value, data.length);

            self.renderJson(self.svg, data, 'incident');
        }
    });
};

App.renderJson = function (svg, json, className) {
    // render json data on map
    var path = path || App.path;

    var hexbin = d3.hexbin()
        .size([self.width, self.height])
        .radius(8);

    var radius = d3.scale.sqrt()
        .domain([0, 12])
        .range([0, 8]);

    svg.append("g")
        .attr('class', 'incidents hexagons')
      .selectAll("path")
        .data(hexbin(json).sort(function(a, b) { return b.length - a.length; }))
      .enter().append("path")
        .attr('class', className)
        .attr("d", function(d) { return hexbin.hexagon(radius(d.length)); })
        .attr('transform', function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        //  .on('mouseover', tip.show)
        //  .on('mouseout', tip.hide);
};

App.load = function () {
	var self = this;
	var layers = ['water', 'landuse', 'roads', 'buildings'];
  	var tiler = d3.geo.tile()
      .size([self.width, self.height]);

    // var color = d3.time.scale()
    //     .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
    //     .range(["black", "steelblue"])
    //     .interpolate(d3.interpolateLab);

    var projection = d3.geo.mercator()
      .center(self.coordinates)
      .scale((1 << 20) / 2 / Math.PI)
      .translate([self.width / 2, self.height / 2]);

    var path = self.path = d3.geo.path()
      .projection(projection);

/****** // Tooltip
    var tip = d3.tip()
      .attr('class', 'map-tooltip')
      .html(createTooltip);
//  uncomment line 83 to call this function
*************/

	self.svg = d3.select('#map').append('div').classed('svg-container', true)
        .append('svg')
          .attr('viewBox', '0 0 '+self.width+' '+self.height)
          .attr('preserveAspectRatio', 'xMidYMid')
          .classed('svg-content-responsive', true);

    // transform data
    incidents.forEach(function (d) {
        // var p = projection(d.geometry.coordinates);
        // d.geometry.coordinates[0] = p[0], d.geometry.coordinates[1] = p[1];
        var p = projection(d);
        d[0] = p[0], d[1] = p[1];
    });

    self.svg.call(renderTiles);
    self.renderJson(self.svg, incidents, 'incident');
//	  .call(renderLegend);
//	  .call(tip);

    function renderTiles (svg) {
        /* Hit Mapzen Vector Tile API for map data */
        svg.selectAll('g')
            .data(
              tiler.scale(projection.scale() * 2 * Math.PI)
              .translate(projection([0, 0]))
            )
          .enter().append('g')
            .each(function (d) {
              var g = d3.select(this);
              d3.json("http://vector.mapzen.com/osm/all/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key=vector-tiles-ZS0fz7o", function(error, json) {

                layers.forEach(function (layer) {
                  var data = json[layer];

                  if (data) {
                    g.selectAll('path')
                        .data(data.features.sort(function(a, b) { return a.properties.sort_key - b.properties.sort_key; }))
                      .enter().append('path')
                        .attr('class', function (d) { return d.properties.kind; })
                        .attr('d', path);
                  }
                });
              });
            });
      }
};
