
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
var ProjectFormView = require('../../project/new/views/project_new_form_view');
var TaskFormView = require('../../tasks/new/views/task_form_view');
var ModalWizardComponent = require('../../../components/modal_wizard');
var ModalComponent = require('../../../components/modal');


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
    // this.options = options;
    this.target = options.target;
    this.fireUpCollection();
    this.initializeView();

    this.collection.trigger('browse:' + this.target + ":fetch");

    this.listenTo(this.projectsCollection, "project:save:success", function (data) {
      // hide the modal
      $('#addProject').bind('hidden.bs.modal', function() {
        Backbone.history.navigate('projects/' + data.attributes.id, { trigger: true });
      }).modal('hide');
    });

    this.listenTo(this.tasksCollection, "task:save:success", function (data) {
      // hide the modal
      $('#addTask').bind('hidden.bs.modal', function() {
        Backbone.history.navigate('tasks/' + data, { trigger: true });
      }).modal('hide');
    });

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
    this.tasksCollection = new TasksCollection();
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

    if (this.projectFormView) this.projectFormView.cleanup();
    if (this.modalComponent) this.modalComponent.cleanup();

    this.modalComponent = new ModalComponent({
      el: ".wrapper-addProject",
      id: "addProject",
      modalTitle: "Add " + i18n.t("Project")
    }).render();

    this.projectFormView = new ProjectFormView({
      el: ".modal-template",
      collection: this.projectsCollection
    }).render();

  },

  addTask: function (e) {
    if (e.preventDefault) e.preventDefault();

    if (this.taskFormView) this.taskFormView.cleanup();
    if (this.modalWizardComponent) this.modalWizardComponent.cleanup();

    this.taskModel = new TaskModel();
    this.modalWizardComponent = new ModalWizardComponent({
      el: ".wrapper-addTask",
      id: "addTask",
      draft: true,
      modalTitle: 'New ' + i18n.t('Opportunity'),
      model: this.taskModel,
      collection: this.tasksCollection,
      modelName: 'task',
      data: function (parent) { return {
        title: parent.$("#task-title").val(),
        description: parent.$("#task-description").val(),
        // these tasks are orphaned
        projectId: null,
        tags: getTags()
      }; }
    }).render();

    this.taskFormView = new TaskFormView({
      el: "#addTask .modal-body",
      projectId: null,
      model: this.taskModel,
      tasks: this.tasksCollection
    }).render();
    this.modalWizardComponent.setChildView(this.taskFormView);
    this.modalWizardComponent.setNext(this.taskFormView.childNext);
    this.modalWizardComponent.setSubmit(this.taskFormView.childNext);

    function getTags() {
      var tags = [];
      tags.push.apply(tags,this.$("#task_tag_topics").select2('data'));
      tags.push.apply(tags,this.$("#task_tag_skills").select2('data'));
      tags.push.apply(tags,this.$("#task_tag_location").select2('data'));
      tags.push.apply(tags,[this.$("#skills-required").select2('data')]);
      tags.push.apply(tags,[this.$("#people").select2('data')]);
      tags.push.apply(tags,[this.$("#time-required").select2('data')]);
      tags.push.apply(tags,[this.$("#time-estimate").select2('data')]);
      tags.push.apply(tags,[this.$("#length").select2('data')]);
      return _(tags).map(function(tag) {
        return (tag.id && tag.id !== tag.name) ? +tag.id : {
          name: tag.name,
          type: tag.tagType,
          data: tag.data
        };
      });
    }

  },

  // ---------------------
  //= UTILITY METHODS
  // ---------------------
  cleanup: function() {
    if (this.taskFormView) { this.taskFormView.cleanup(); }
    if (this.modalWizardComponent) { this.modalWizardComponent.cleanup(); }
    if (this.projectFormView) { this.projectFormView.cleanup(); }
    if (this.modalComponent) { this.modalComponent.cleanup(); }
    if (this.browseMainView) { this.browseMainView.cleanup(); }
    removeView(this);
  }

});

module.exports = Browse.ListController;
