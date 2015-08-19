
var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var BrowseMainView = require('../views/browse_main_view');
var ProjectsCollection = require('../../../entities/projects/projects_collection');
var TasksCollection = require('../../../entities/tasks/tasks_collection');
var ProfilesCollection = require('../../../entities/profiles/profiles_collection');
var TaskModel = require('../../../entities/tasks/task_model');
var NewProjectModal = require('../../project/new/views/new_project_modal');
var NewTaskModal    = require('../../tasks/new/views/new_task_modal');


Browse = {};

Browse.ListController = BaseController.extend({

  events: {
    "click .link-backbone"  : linkBackbone,
    "click .project-background-image" : "showProject",
    "click .task-box"       : "showTask",
    "click .add-project"    : "addProject",
    "click .add-opportunity": "addTask"
  },

  initialize: function ( options ) {
    var self = this;

    // this.options = options;
    this.target = options.target;
    this.fireUpCollection();
    this.initializeView();

    this.collection.trigger('browse:' + this.target + ":fetch");
  },

  initializeView: function () {
    if (this.browseMainView) {
      this.browseMainView.cleanup();
    }
    this.browseMainView = new BrowseMainView({
      el: "#container",
      target: this.target,
      collection: this.collection
    }).render();
  },

  fireUpCollection: function () {
    var self = this;
    this.projectsCollection = new ProjectsCollection();
    this.tasksCollection    = new TasksCollection();
    this.profilesCollection = new ProfilesCollection();
    if (this.target == 'projects') {
      this.collection = this.projectsCollection;
    } else if (this.target == 'tasks') {
      this.collection = this.tasksCollection;
    } else {
      this.collection = this.profilesCollection;
    }
    this.listenToOnce(this.collection, 'browse:' + this.target + ":fetch", function () {
      self.collection.fetch({
        success: function (collection) {
          self.collection = collection;
          self.browseMainView.renderList(self.collection.toJSON());
          if (self.target == 'profiles') {
            self.browseMainView.renderMap(self.collection.toJSON());
          }
        }
      });
    });
  },

  // -----------------------
  //= BEGIN CLASS METHODS
  // -----------------------
  showProject: function (e) {
    if (e.preventDefault) e.preventDefault();
    var id = $($(e.currentTarget).parents('li.project-box')[0]).data('id');
    Backbone.history.navigate('projects/' + id, { trigger: true });
  },

  showTask: function (e) {
    if (e.preventDefault) e.preventDefault();
    var id = $(e.currentTarget).data('id') || $($(e.currentTarget).parents('li.task-box')[0]).data('id');
    Backbone.history.navigate('tasks/' + id, { trigger: true });
  },

  addProject: function (e) {
    if (e.preventDefault) e.preventDefault();

    if (this.newProjectModal) this.newProjectModal.cleanup();
    this.newProjectModal = new NewProjectModal({
      el: "#addProject-wrapper",
      collection: this.projectsCollection,
    }).render();
  },

  addTask: function (e) {
    if (e.preventDefault) e.preventDefault();

    if (this.newTaskModal) this.newTaskModal.cleanup();
    this.newTaskModal = new NewTaskModal({
      el: this.$("#addTask-wrapper"),
      collection: this.tasksCollection,
    }).render();
  },

  // ---------------------
  //= UTILITY METHODS
  // ---------------------
  cleanup: function() {
    if (this.newTaskModal) { this.newTaskModal.cleanup(); }
    if (this.newProjectModal) { this.newProjectModal.cleanup(); }
    if (this.browseMainView) { this.browseMainView.cleanup(); }
    removeView(this);
  }

});

module.exports = Browse.ListController;
