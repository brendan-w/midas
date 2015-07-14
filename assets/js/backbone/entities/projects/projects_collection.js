var _ = require('underscore');
var Backbone = require('backbone');
var ProjectModel = require('./project_model');


var ProjectsCollection = Backbone.Collection.extend({

  model: ProjectModel,

  url: '/api/project/findAll',

  parse: function (response) {
    return response.projects;
  },

  initialize: function () {
    var self = this;

    this.listenTo(this, "project:save", function (data) {
      self.addAndSave(data);
    });
  },

  open: function() {
    return this.where({
      state: "open",
      archived: false
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
