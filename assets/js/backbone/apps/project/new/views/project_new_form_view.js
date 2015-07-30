var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');

var ModalView           = require('../../../../components/modal_new');
var MarkdownEditor      = require('../../../../components/markdown_editor');
var ProjectFormTemplate = require('../templates/project_new_form_template.html');


var ProjectFormView = Backbone.View.extend({

  events: {
    "blur #project-form-title"      : "v",
    "blur #project-form-description": "v",
  },

  render: function () {
    if(this.modal) this.modal.cleanup();

    this.modal = new ModalView({
      el: this.el,
    }).render();

    this.listenTo(this.modal, "submit", this.post);

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: _.template(ProjectFormTemplate)({}),
      doneButtonText: 'Add ' + i18n.t('Project'),
    });

    this.initializeTextArea();

    this.modal.show();

    return this;
  },

  hide: function() {
    this.modal.hide();
  },

  v: function (e) {
    return validate(e);
  },

  initializeTextArea: function () {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: '',
      el: ".markdown-edit",
      id: 'project-form-description',
      placeholder: 'A description of your ' + i18n.t('project') + ' that explains the focus, objectives, and deliverables.',
      title: i18n.t('Project') + ' Description',
      rows: 6,
      validate: ['empty']
    }).render();
  },

  post: function (e) {
    if (e && e.preventDefault) e.preventDefault();

    // validate input fields
    var validateIds = ['#project-form-title', '#project-form-description'];
    var abort = false;
    for (i in validateIds) {
      var iAbort = validate({ currentTarget: validateIds[i] });
      abort = abort || iAbort;
    }
    if (abort === true) {
      return;
    }

    // process project form
    var data;
    data = {
      title       : this.$(".project-title-form").val(),
      description : this.$("#project-form-description").val()
    };

    this.collection.trigger("project:save", data);
  },

  cleanup: function () {
    if(this.md)    this.md.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = ProjectFormView;
