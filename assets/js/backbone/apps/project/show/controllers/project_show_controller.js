var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var Popovers = require('../../../../mixins/popovers');
var BaseController = require('../../../../base/base_controller');
var ProjectItemView = require('../views/project_item_view');
// var ProjectItemCoreMetaView = require('../views/project_item_coremeta_view');
var ProjectownerShowView = require('../../../projectowner/show/views/projectowner_show_view');
var TaskListController = require('../../../tasks/list/controllers/task_list_controller');
var ModalComponent = require('../../../../components/modal');
var ModalAlert = require('../../../../components/modal_alert');
var TaskModel = require('../../../../entities/tasks/task_model');
var ProjectOpenTasksWarningTemplate = require('../templates/project_open_tasks_warning_template.html');
var AlertTemplate = require('../../../../components/alert_template.html');


var popovers = new Popovers();

Project = {};

Project.ShowController = BaseController.extend({

  el: "#container",

  // Set the model to null, before it is fetched from the server.
  // This allows us to clear out the previous data from the list_view,
  // and get ready for the new data for the project show view.
  model: null,

  events: {
    "click #project-close"                 : "stateClose",
    "click #project-reopen"                : "stateReopen",
    'click #editProject'                   : 'toggleEditMode',
    "mouseenter .project-people-show-div"  : popovers.popoverPeopleOn,
    "click .project-people-show-div"       : popovers.popoverClick
  },

  // The initialize method is mainly used for event bindings (for effeciency)
  initialize: function (options) {
    var self = this;

    this.router = options.router;
    this.id     = options.id;
    this.data   = options.data;
    this.action = options.action;
    this.edit   = (options.action == 'edit');

    this.listenTo(this.model, "project:model:fetch:success", function (projectModel) {
      self.model = projectModel;
      if (self.action == 'edit') {
        var model = this.model.toJSON();
        // check if the user owns the task
        var owner = model.isOwner;
        if (owner !== true) {
          // if none of these apply, are they an admin?
          if (window.cache.currentUser) {
            if (window.cache.currentUser.isAdmin === true) {
              owner = true;
            }
          }
        }
        // if not the owner, trigger the login dialog.
        if (owner !== true) {
          window.cache.userEvents.trigger("user:request:login", {
            message: "You are not the owner of this project. <a class='link-backbone' href='/projects/" + _.escape(model.id) + "'>View the project instead.</a>",
            disableClose: true
          });
          return;
        }
      }
      self.initializeItemView();
    });

    this.listenTo(this.model, "project:model:fetch:error", function (projectModel, xhr) {
      //this template is populated by the Global AJAX error listener
      var template = _.template(AlertTemplate)();
      self.$el.html(template);
    });


    this.model.on("project:show:rendered", function () {
      // self.initializeItemCoreMetaView();
      self.initializeOwners();
      self.initializeItemViewControllers();
      self.initializeHandlers();
      self.initializeUI();
    });

    //this fetch will trigger the handlers above to get things started
    this.model.trigger("project:model:fetch", this.model.id);
  },

  initializeItemView: function () {
    if (this.projectShowItemView) this.projectShowItemView.cleanup();
    this.projectShowItemView  = new ProjectItemView({
                              model: this.model,
                              action: this.action,
                              data: this.data
                            }).render();
  },

  /*
  initializeItemCoreMetaView: function () {
    if (this.projectShowItemCoreMetaView) this.projectShowItemCoreMetaView.cleanup();
    this.projectShowItemCoreMetaView  = new ProjectItemCoreMetaView({
                              model: this.model,
                              action: this.action,
                              data: this.data
                             }).render();
  },
  */

  initializeOwners : function(){
    if (this.projectownerShowView) this.projectownerShowView.cleanup();
    this.projectownerShowView = new ProjectownerShowView({
                              model: this.model,
                              action: this.action,
                              data: this.data
                             }).render();
  },

  initializeItemViewControllers: function () {
    if (this.action != 'edit') {
      // Tasks
      if (this.taskListController) this.taskListController.cleanup();
      this.taskListController = new TaskListController({
        projectId: this.model.id
      });
    }
  },

  initializeHandlers: function() {
    this.listenTo(this.model, "project:update:state:success", function (data) {
      if (data.attributes.state == 'closed') {
        $("#li-project-close").hide();
        $("#li-project-reopen").show();
        $("#alert-closed").show();
      } else {
        $("#li-project-close").show();
        $("#li-project-reopen").hide();
        $("#alert-closed").hide();
      }
    });
  },

  initializeUI: function() {
    popovers.popoverPeopleInit(".project-people-show-div");
  },

  toggleEditMode: function(e){
    if (e.preventDefault) e.preventDefault();
    var action = '';
    if (!(this.action && this.action == 'edit')) {
      action = '/edit';
    }
    Backbone.history.navigate('projects/' + this.id + action, { trigger: true });
  },

  stateClose: function (e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    var projectTasks = self.model.hasOpenTasks(self.taskListController.collection);
    if (this.modalAlert) { this.modalAlert.cleanup(); }
    if (this.modalComponent) { this.modalComponent.cleanup(); }
    this.modalComponent = new ModalComponent({
      el: "#modal-close",
      id: "check-close",
      modalTitle: "Close "+i18n.t("Project")
    }).render();

    var count = 0;
    if ( projectTasks.hasOpenTasks ){
      var modalContent = _.template(ProjectOpenTasksWarningTemplate)({count: projectTasks.count});
      var submitLabel = "I Understand and Want to Close This "+i18n.t("Project");
    } else {
      var modalContent = '<p>Are you sure you want to close this '+i18n.t("project")+'?  Once the '+i18n.t("project")+' is closed, participants will no longer be able to contribute.</p>';
      var submitLabel = "Close "+i18n.t("Project");
    }

    this.modalAlert = new ModalAlert({
      el: "#check-close .modal-template",
      modalDiv: '#check-close',
      content: modalContent,
      cancel: 'Cancel',
      submit: submitLabel,
      callback: function (e) {
        // user clicked the submit button
        if ( projectTasks.hasOpenTasks ) { self.model.trigger("project:update:tasks:orphan",self.taskListController.collection); }
        self.model.trigger("project:update:state", 'closed');
        self.initializeItemView();
      }
    }).render();
  },

  stateReopen: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.model.trigger("project:update:state", 'open');
  },

  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function() {
    if (this.projectShowItemCoreMetaView) this.projectShowItemCoreMetaView.cleanup();
    if (this.taskListController) this.taskListController.cleanup();
    // if (this.eventListController) this.eventListController.cleanup();
    // if (this.commentListController) this.commentListController.cleanup();
    if (this.projectShowItemView) this.projectShowItemView.cleanup();
    if (this.projectownerShowView) this.projectownerShowView.cleanup();
    // if (this.attachmentView) this.attachmentView.cleanup();
    removeView(this);
  }

});

module.exports = Project.ShowController;
