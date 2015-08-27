// jshint devel:true
'use strict';

var App = App || {
    width: 1300,
    height: 800,
    coordinates: [-122.2708, 37.8044],
    rendered: false,
};

App.init = function () {
    console.log('YO');
}

App.load = function () {
	var self = this;
	var layers = ['water', 'landuse', 'roads', 'buildings'];
  	var tiler = d3.geo.tile()
      .size([self.width, self.height]);

    // var color = d3.time.scale()
    //     .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
    //     .range(["black", "steelblue"])
    //     .interpolate(d3.interpolateLab);

    var hexbin = d3.hexbin()
        .size([self.width, self.height])
        .radius(8);

    var radius = d3.scale.sqrt()
        .domain([0, 12])
        .range([0, 8]);

    var projection = d3.geo.mercator()
      .center(self.coordinates)
      .scale((1 << 20) / 2 / Math.PI)
      .translate([self.width / 2, self.height / 2]);

    var path = d3.geo.path()
      .projection(projection);

/****** // Tooltip
    var tip = d3.tip()
      .attr('class', 'map-tooltip')
      .html(createTooltip);
//  uncomment line 83 to call this function
*************/

/****** // Zoom functionality
	var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 12, 1 << 25])
    // San Francisco - 37.7524/-122.4407
    .translate(projection([-122.4407, 37.7524]).map(function(x) { return -x; }))
    .on("zoom", zoomed);
//  uncomment line 84 to call zoom function
*************/

	var svg = d3.select('#map').append('div').classed('svg-container', true)
        .append('svg')
          .attr('viewBox', '0 0 '+self.width+' '+self.height)
          .attr('preserveAspectRatio', 'xMidYMid')
          .classed('svg-content-responsive', true)

    svg.call(renderTiles);
    renderJson(svg, incidents, 'incident');
//	  .call(renderLegend);
//	  .call(tip)
//    .call(zoom);


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

    function renderJson (svg, json, className) {
        // render json data on map

        svg.append("g")
            .selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr('class', className)
            .attr("d", path);
            //  .on('mouseover', tip.show)
            //  .on('mouseout', tip.hide);
    }
}
