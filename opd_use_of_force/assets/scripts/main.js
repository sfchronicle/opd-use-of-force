// jshint devel:true
'use strict';

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
    height: 650,
    coordinates: [-122.2708, 37.7990]
};

App.init = function () {
    var self = this;
    self.load();
    self.slider();
    $(document).foundation();
};

App.slider = function () {
    var self = this;
    updateMapLabel('2007-2015', incidents.length);

    $('#methodology').on('toggled', function (event, accordion) {
        pymChild.sendHeight();
    });

    $('#show-all-data').on('click', function (event) {
        event.preventDefault();
        self.svg.select('g.incidents').remove();
        $('#total-label').css('display', 'inline');

        self.renderJson(self.svg, incidents, 'incident');

        updateMapLabel('2007-2015', incidents.length);
        slider.noUiSlider.set(2007);

    });

    var slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        step: 1,
    	start: [ 2007], // Handle start position
    	range: { // Slider can select '0' to '100'
    		'min': 2007,
    		'max': 2015
    	}
    });

    slider.noUiSlider.on('slide', function (values, handle, unencoded) {
        $('.button').addClass('disabled');

        self.svg.select('g.incidents').remove();
        var data = incidents.filter(function (incident) {
            return parseInt(incident[2].year) === unencoded;
        });

        $('#total-label').css('display', 'none');

        updateMapLabel(unencoded, data.length);

        self.renderJson(self.svg, data, 'incident', 4);
    });
    slider.noUiSlider.on('change', function () {
        $('.button').removeClass('disabled');
    });
};

App._formatData= function (hexbin, json, slideAdjustment) {
    /* Given a d3.hexbin and JSON,
       generate hexbin layout and domain for hexbin map
    */
    var bins = hexbin(json).sort(function(a, b) { return b.length - a.length; });
    var count = [];
    bins.forEach(function(elem) { count.push(elem.length); });
    var domain = [0, (157.59416209911797 / slideAdjustment)]; // [0, (ss.mean(count) + (ss.standardDeviation(count) * 3))]
    var color = d3.scale.linear()
        .domain(domain)
        .range(["#C12020", "#b21e1e"])  //.range(["#C17575", "#C12020"])
        .interpolate(d3.interpolateLab);

    return {
        data: bins,
        domain: domain,
        color: color
    };
};

App.renderJson = function (svg, json, className, slideAdjustment) {
    // render json data on map
    var self = this;
    var path = path || App.path;

    var hexbin = d3.hexbin()
        .size([self.width, self.height])
        .radius(8);

    var slideAdjustment = slideAdjustment || 1;
    var data = self._formatData(hexbin, json, slideAdjustment);

    var radius = d3.scale.sqrt()
        .domain(data.domain) // App._generateDomain(); 197.9668906095526
        .range([1, 8])
        //.clamp(true);

    svg.append("g")
        .attr('class', 'incidents hexagons')
      .selectAll("path")
        .data(data.data)
      .enter().append("path")
        .attr('class', className)
        .attr("d", function(d) { return hexbin.hexagon(radius(d.length)); })
        .attr('fill', function (d) { return data.color(d.length); })
        .attr('transform', function (d) { return "translate(" + d.x + "," + d.y + ")"; });
};

App.load = function () {
	var self = this;
	var layers = ['water', 'landuse', 'roads', 'buildings'];
  	var tiler = d3.geo.tile()
      .size([self.width, self.height]);

    var projection = d3.geo.mercator()
      .center(self.coordinates)
      .scale((1 << 20) / 2 / Math.PI)
      .translate([self.width / 2, self.height / 2]);

    var path = self.path = d3.geo.path()
      .projection(projection);

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
    d3.select('#map').append('small')
        .attr('class', 'attribution')
        .html('© <a href="https://www.openstreetmap.org/copyright" target="_top">OpenStreetMap contributors</a> | <a href="https://mapzen.com/projects/vector-tiles" title="Tiles courtesy of Mapzen" target="_top">Mapzen</a>');
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
              g.attr('class', 'tile');
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
        try {
            pymChild.sendHeight();
        } catch (e) {}
      }
};
