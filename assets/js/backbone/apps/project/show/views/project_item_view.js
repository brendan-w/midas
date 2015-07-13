
var        _ = require('underscore');
var Backbone = require('backbone');
var   marked = require('marked');
var    utils = require('../../../../mixins/utilities');

var       MarkdownEditor = require('../../../../components/markdown_editor');
var  ProjectShowTemplate = require('../templates/project_view_template.html');
var ProjectCloseTemplate = require('../templates/project_close_template.html');
var   TaskListController = require('../../../tasks/list/controllers/task_list_controller');
var        ShareTemplate = require('../templates/project_share_template.txt');
var           ModalAlert = require('../../../../components/modal_alert');
var       ModalComponent = require('../../../../components/modal');


var ProjectShowView = Backbone.View.extend({

  el: "#container",

  events: {
    "click #project-edit"    : "enter_edit_mode",
    "click #project-discard" : "exit_edit_mode",
    "click #project-save"    : "exit_edit_mode_and_save",
    "click #project-close"   : "close",
    "click #project-reopen"  : "reopen",

    "blur #project-edit-title"       : "v",
    "blur #project-edit-description" : "v",
  },

  initialize: function (options) {
    this.options = options;
    this.data    = options.data;
    this.action  = options.action;
    this.edit    = (options.action == 'edit');
  },

  render: function () {

    //convert the model to JSON, and translate the description
    //out of markdown, and into HTML
    var project = this.model.toJSON();
    project.description_html = marked(project.description || "");

    //render the main page template
    var t = _.template(ProjectShowTemplate)({
      project:  project,
      edit:     this.edit,
      user:     window.cache.currentUser || {},
      hostname: window.location.hostname,
    });

    this.$el.html(t);
    this.$el.i18n();

    // this.updateProjectEmail();

    //populate the .task-list-wrapper
    if (this.taskListController) this.taskListController.cleanup();
    this.taskListController = new TaskListController({
      projectId: this.model.id
    });

    //if we're in edit mode, setup the edit controls
    if(this.edit) this.render_edit();

    this.model.trigger("project:show:rendered");
    return this;
  },


  render_edit: function() {

    if (this.md) this.md.cleanup();

    this.md = new MarkdownEditor({
      data: this.model.toJSON().description,
      el: ".markdown-edit",
      id: 'project-edit-description',
      title: 'Project Description',
      rows: 4,
      validate: ['empty']
    }).render();

  },

  enter_edit_mode: function(e) {
    if (e.preventDefault) e.preventDefault();
    var url = 'projects/' + this.model.get('id') + '/edit';
    Backbone.history.navigate(url, { trigger: true });
  },

  exit_edit_mode: function(e) {
    if (e.preventDefault) e.preventDefault();
    var url = 'projects/' + this.model.get('id');
    Backbone.history.navigate(url, { trigger: true });
  },

  exit_edit_mode_and_save: function(e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    // validate the form fields
    var validateIds = ['#project-edit-title', '#project-edit-description'];
    var abort = false;
    for(var i in validateIds)
    {
      abort = abort || validate({ currentTarget: validateIds[i] });
    }
    if(abort) return;

    //on success, exit edit mode
    this.model.on("project:save:success", function() {
      self.exit_edit_mode(e);
    });

    //update the model
    this.model.update({
      title:       this.$('#project-edit-title').val(),
      description: this.$('#project-edit-description').val(),
    });
  },


  close: function(e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    var taskCount = this.taskListController.collection.countOpen();

    if (this.modalAlert)     this.modalAlert.cleanup();
    if (this.modalComponent) this.modalComponent.cleanup();

    //make a single-page modal
    this.modalComponent = new ModalComponent({
      el: "#modal-close",
      id: "check-close",
      modalTitle: "Close "+i18n.t("Project")
    }).render();

    //make and show the modal form
    this.modalAlert = new ModalAlert({
      el: "#check-close .modal-template",
      modalDiv: '#check-close',
      content: _.template(ProjectCloseTemplate)({ count: taskCount }),
      submit: "Close " + i18n.t("Project"),
      cancel: 'Cancel',
      callback: function (e) {
        // user clicked the submit button
        if(taskCount > 0)
          self.model.trigger("project:update:tasks:orphan", self.taskListController.collection);

        self.model.trigger("project:update:state", 'closed');
        self.render();
      }
    }).render();
  },

  reopen: function(e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    this.model.on("project:update:state:success", function() {
      self.render();
    });

    this.model.trigger("project:update:state", 'open');
  },

  /*
  updateProjectEmail: function() {
    var subject = 'Take A Look At This Project',
        data = {
          projectTitle: this.model.get('title'),
          projectLink: window.location.protocol +
            "//" + window.location.host + "" + window.location.pathname,
          projectDescription: this.model.get('description')
        },
        body = _.template(ShareTemplate)(data),
        link = 'mailto:?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);

    this.$('#email').attr('href', link);
  },
  */

  v: function(e) {
    return validate(e);
  },

  cleanup: function () {
    if (this.md)                 this.md.cleanup();
    if (this.taskListController) this.taskListController.cleanup();
    removeView(this);
  },
});

module.exports = ProjectShowView;
