var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');

var ModalView          = require('../../../../components/modal_new');
var ProjectModel       = require('../../../../entities/projects/project_model');
var MarkdownEditor     = require('../../../../components/markdown_editor');
var NewProjectTemplate = require('../templates/new_project_template.html');

/*
  Pass this modal a Project_Collection when creating
*/

var NewProjectModal = Backbone.View.extend({

  events: {
    "blur #project-form-title"      : "v",
    "blur #project-form-description": "v",
  },

  render: function () {
    if(this.modal) this.modal.cleanup();

    this.modal = new ModalView({
      el: this.el,
    }).render();

    this.modal.onNext(this.next);
    this.listenTo(this.modal, "submit", this.submit);

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: _.template(NewProjectTemplate)({}),
      doneButtonText: 'Add ' + i18n.t('Project'),
    });

    this.initializeTextArea();

    this.modal.show();

    return this;
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

  //called every time the modal wants to continue (or submit)
  //validate everything
  next: function($page) {
    return !validateAll($page);
  },

  submit: function() {
    var self = this;

    //when the collection add is successful, redirect to the newly created project
    this.listenTo(this.collection, "project:save:success", function (data) {
      // redirect when the modal is fully hidden
      self.$el.bind('hidden.bs.modal', function() {
        Backbone.history.navigate('projects/' + data.attributes.id, { trigger: true });
      });

      self.modal.hide();
    });

    this.collection.addAndSave({
      title       : this.$(".project-title-form").val(),
      description : this.$("#project-form-description").val()
    });
  },

  cleanup: function () {
    if(this.md)    this.md.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = NewProjectModal;
