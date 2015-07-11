
var        _ = require('underscore');
var Backbone = require('backbone');
var   marked = require('marked');
var    utils = require('../../../../mixins/utilities');

var      MarkdownEditor = require('../../../../components/markdown_editor');
var ProjectShowTemplate = require('../templates/project_item_view_template.html');
var       ShareTemplate = require('../templates/project_share_template.txt');




var ProjectShowView = Backbone.View.extend({

  el: "#container",

  events: {
    "click #editProject"    : "enter_edit_mode",
    "click #discardChanges" : "exit_edit_mode",
    "click #saveChanges"    : "exit_edit_mode_and_save",

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

    var t = _.template(ProjectShowTemplate)({
      project:  project,
      edit:     this.edit,
      user:     window.cache.currentUser || {},
      hostname: window.location.hostname,
    });

    this.$el.html(t);
    this.$el.i18n();

    this.updateProjectEmail();

    //idf we're in edit mode, setup the edit controls
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
    Backbone.history.navigate('projects/' + this.model.get('id') + '/edit', { trigger: true });
  },

  exit_edit_mode: function(e) {
    if (e.preventDefault) e.preventDefault();
    Backbone.history.navigate('projects/' + this.model.get('id'), { trigger: true });    
  },

  exit_edit_mode_and_save: function(e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    // validate the form fields
    var validateIds = ['#project-edit-title', '#project-edit-description'];
    for(var i in validateIds)
    {
      if(validate({ currentTarget: validateIds[i] }))
        return;
    }

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

  v: function(e) {
    return validate(e);
  },

  cleanup: function () {
    if (this.md) { this.md.cleanup(); }
    removeView(this);
  },
});

module.exports = ProjectShowView;
