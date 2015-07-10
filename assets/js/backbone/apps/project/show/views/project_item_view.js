
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

    this.initializeToggle();
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
      id: 'project-edit-form-description',
      title: 'Project Description',
      rows: 4,
      validate: ['empty']
    }).render();

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

  initializeToggle: function () {
    if(this.edit){
      this.$('#editProject').find('.box-icon-text').html('View ' + i18n.t('Project'));
    }
    else{
      this.$('#editProject').find('.box-icon-text').html('Edit ' + i18n.t('Project'));
    }
  },

  cleanup: function () {
    removeView(this);
  },
});

module.exports = ProjectShowView;
