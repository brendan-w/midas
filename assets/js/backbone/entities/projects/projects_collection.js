var _ = require('underscore');
var Backbone = require('backbone');
var ProjectModel = require('./project_model');


var ProjectsCollection = Backbone.Collection.extend({

  model: ProjectModel,

  url: '/api/project/findAll',

  parse: function (response) {
    return response.projects;
  },

  loadAll: function() {
    var self = this;
    this.fetch({
      success: function(collection, response, options) {
        self.trigger("projects:fetch:success", collection);
      },
      error: function(collection, response, options) {
        self.trigger("projects:fetch:error", collection);
      },
    })
  },

  initialize: function () {
    var self = this;

    this.listenTo(this, "project:save", function (data) {
      self.addAndSave(data);
    });
  },

  addAndSave: function (data) {
    var project, self = this;

    project = new ProjectModel({
      title: data['title'],
      description: data['description']
    });

    project.save({}, {
      success: function (data) {
        self.add(project);
        self.trigger("project:save:success", data);

        /*
          Warning: This is a temporary hack to update the projects dropdown in the
                   navbar.
          TODO: instead of using userEvents as a global event broker, there should
                be a system-wide Project Collection to avoid redundant fetch()es
        */
        window.cache.userEvents.trigger("project:save:success", data);
      }
    });
  }

});

module.exports = ProjectsCollection;
