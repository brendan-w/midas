var _ = require('underscore');
var Backbone = require('backbone');
var Bootstrap = require('bootstrap');
var utils = require('../../../../mixins/utilities');
var BaseView = require('../../../../base/base_view');

var VetShowTemplate = require('../templates/vet_show_template.html');
var ProjectCollection = require('../../../../entities/projects/projects_collection');


/*
  pass this view a model for the user currently being viewed
*/
var VetShowView = BaseView.extend({

  initialize: function(options) {
    this.options = options;

    //get all project names
    this.projectCollection = new ProjectCollection();
  },

  render: function() {
    var self = this;

    //TODO: move this HTTP request to a one-time location
    this.projectCollection.fetch({
      success: function(collection) {

        var projects = [];

        self.projectCollection.open().forEach(function(project) {
          projects.push({
            title: project.get('title'),
            vetted: self.model.isVettedFor(project.get('id')),
          });
        });

        //projects sorted by name
        projects = _.sortBy(projects, function(p) { return p.title; });

        self.$el.html(_.template(VetShowTemplate)({
          projects: projects,
        }));

        self.$el.i18n();
      },
      //TODO: handle errors
    });

  },

  cleanup: function() {
    removeView(this);
  }
});

module.exports = VetShowView;
