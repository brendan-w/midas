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
      }
    });
  }

});

module.exports = ProjectsCollection;
