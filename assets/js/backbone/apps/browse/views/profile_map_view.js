// Use D3 to generate a nice looking world map with dots for our users.
//
// Scaling: pick height and width based on how the view is originally
// scaled. SVG scaling will take care of the rest to make it responsive.
// staticScale stores what that was when map was first drawn, and
// dynamicScale changes as the SVG is resized.
//
// code for world map adapted from https://gist.github.com/mbostock/4180634
// and http://techslides.com/demos/d3/worldmap-template.html
// and http://bl.ocks.org/rveciana/5181105 (tooltips)

var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var topojson = require('topojson');
var tooltipTemplate = require('../templates/profile_map_tooltip.html');
var countryData = require('../../../../../data/world-110m.json');

var PeopleMapView = Backbone.View.extend({

  initialize: function (options) {
    this.el = options.el;
    this.target = options.target;
    this.router = options.router;
    this.people = options.people;

    this.smallestDotPx = 5;         // size of smallest dot
    this.dotSizeFactor = options.dotSizeFactor || 3;
    this.center = [0, 25];          // favor the northern hemisphere
    this.rotate = [-10, 0];         // break map cleanly in pacific
    this.tipDescTemplate = _.template(tooltipTemplate);

    this.countries = topojson.feature(countryData, countryData.objects.countries).features;
  },

  render: function () {
    var self = this;
    // mercator projection is 960 x 500 @ 150 points, scale relative to that
    this.width = this.$el.width();
    this.height = Math.round(this.width / 2) - 50;
    this.staticScale = this.width / 960;

    this.svg = d3.select(this.el).append('svg')
      .attr("preserveAspectRatio", "xMaxYMid")
      .attr("meetOrSlice", "slice")
      .attr("viewBox", "0 0 " + this.width + " " + this.height);

    this.renderCountries();
    this.renderUserDots();
  },

  renderCountries: function () {
    this.projection = d3.geo.mercator()
      .scale(150 * this.staticScale)
      .translate([Math.round(this.width / 2), Math.round(this.height / 2)])
      .center(this.center)
      .rotate(this.rotate);

    this.path = d3.geo.path()
      .projection(this.projection);

    this.svg.append("g")
      .selectAll(".country")
      .data(this.countries)
      .enter()
      .insert("path", ".boundary")
      .attr("class", "country")
      .attr("d", this.path);
  },

  renderUserDots: function () {
    var self = this;

    // massage data: pivot list of people by city, flatten that into a list with
    // cityname, people in that city, sorted largest first (so largest cities get
    // drawn first (bottom).
    var peopleWithLocations = this.people
      .filter(function (p) {
        return !_.isUndefined(p.location);
      });
    var cityPeopleObj = _.groupBy(peopleWithLocations, function (p) {
      return p.location.name;
    });
    var cityPeopleList = _.map(_.keys(cityPeopleObj), function (c) {
      return {
        cityname: c,
        people: cityPeopleObj[c]
      }
    });
    cityPeopleList = _.sortBy(cityPeopleList, function (cp) {
      return cp.people.length * -1;
    });

    var dotScale = d3.scale.linear()
      .domain([1, cityPeopleList[0].people.length])
      .range([
        this.smallestDotPx * this.staticScale,
        this.smallestDotPx * this.staticScale * this.dotSizeFactor
      ]);

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");

    var usersG = this.svg.append("g");
    _.values(cityPeopleList).forEach(function (cp) {
      var cityLoc = cp.people[0].location;
      var tipDesc = this.tipDescTemplate({
        city: cp.cityname,
        count: cp.people.length,
        names: _.map(cp.people, function (p) {
          return p.name;
        }).slice(0, 3).join(', ')    // only show three names
      });

      if (!cityLoc.data || !cityLoc.data.lon || !cityLoc.data.lat) {
        console.log("Warning: skipped city, missing data:", cp.cityname + ",",
          cp.people.length, "users");
        return;
      }

      var projectedPoint = this.projection([cityLoc.data.lon, cityLoc.data.lat]);
      usersG.append("g")
        .append("svg:circle")
        .attr("class", "userDot")
        .attr("cx", projectedPoint[0])
        .attr("cy", projectedPoint[1])
        .attr("r", dotScale(cp.people.length))
        .attr("pointer-events", "all")
        .on("click", function () {
          var previouslySelected = this.classList.contains('userDot-select');
          // jQuery removeClass() doesn't work on svg elements, but this does
          $('.userDot-select').attr("class", "userDot");
          if (previouslySelected) {
            // unselect city: remove styling & re-render list w/ default
            self.trigger("browseRemove", {type: "location", render: true});
          } else {
            // select city: add styling, render people detail list below
            this.classList.add('userDot-select');
            self.trigger("browseRemove", {type: "location", render: false});
            self.trigger("browseSearchLocation", cp.cityname);
          }
          d3.event.stopPropagation();
        })
        // gobble up the doubleclick and mousedown events on the map since these go on
        // to cause ugly selection on the table.
        .on("dblclick", function () {
          d3.event.stopPropagation();
          d3.event.preventDefault();
        })
        .on("mousedown", function () {
          d3.event.stopPropagation();
          d3.event.preventDefault();
        })
        // mouseenter/out events for displaying the floating legend (tooltip)
        .on("mouseenter", function () {
          tooltip.html(tipDesc)
            .style("visibility", "visible")
            .style("left", String(d3.event.pageX + 20) + "px")
            .style("top", String(d3.event.pageY - 20) + "px")
          return true;
        })
        .on("mouseout", function () {
          return tooltip.style("visibility", "hidden");
        });

      // fallthrough click handler: deselect all dots & re-render list w/ default
      $('svg').on('click', function () {
        $('.userDot-select').attr("class", "userDot");
        self.trigger("browseRemove", {type: "location", render: true});
        d3.event.stopPropagation();
        d3.event.preventDefault();
      });
    }, this);
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = PeopleMapView;
