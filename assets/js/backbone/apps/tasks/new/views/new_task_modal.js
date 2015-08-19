var _         = require('underscore');
var async     = require('async');
var Backbone  = require('backbone');
var Bootstrap = require('bootstrap');
var utilities = require('../../../../mixins/utilities');

var ModalView       = require('../../../../components/modal_new');
var MarkdownEditor  = require('../../../../components/markdown_editor');
var NewTaskTemplate = require('../templates/new_task_template.html');
var TagView         = require('../../../tag/show/views/tag_show_view');


var NewTaskModal = Backbone.View.extend({

  events: {
    "change .validate"        : "v",
    "change #task-location" : "locationChange"
  },

  /*
    @param {Object}  options
    @param {Integer} options.projectId   -  optional Id of the parent project
  */
  initialize: function(options) {
    this.options = _.extend(options, this.defaults);

    //ID of the parent project
    //if no projectId is specified, then the tasks created will be orphaned
    this.projectId = options.projectId || null;
  },


  render: function() {
    if(this.modal) this.modal.cleanup();

    this.modal = new ModalView({
      el: this.el,
    }).render();

    this.modal.onNext(this.next);
    this.listenTo(this.modal, "submit", this.submit);

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: _.template(NewTaskTemplate)({ tags: this.tagSources }),
      doneButtonText: 'Post ' + i18n.t('Task'),
    });

    this.initializeTags();
    this.initializeDates();
    this.initializeTextArea();

    this.modal.show();
    this.modal.gotoPage(3);

    // Return this for chaining.
    return this;
  },

  v: function(e) {
    return validate(e);
  },

  next: function($page) {
    return !validateAll($page);
  },

  initializeTags: function() {
    if(this.tagView) this.tagView.cleanup();
    this.TagView = new TagView({
      el:     this.el,
      edit:   true,
      target: "task",
    }).render();
  },

  initializeDates: function() {
    this.$('#applyBy').datetimepicker();
    this.$('#startedBy').datetimepicker();
  },

  initializeTextArea: function() {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: '',
      el: ".markdown-edit",
      id: 'task-description',
      placeholder: 'Description of ' + i18n.t('task') + ' including goals, expected outcomes and deliverables.',
      title: i18n.t('Task') + ' Description',
      rows: 6,
      validate: ['empty']
    }).render();
  },

  submit: function($form) {
    var self = this;

    //when the collection add is successful, redirect to the newly created task
    this.listenTo(this.collection, "task:save:success", function(data) {

      // redirect when the modal is fully hidden
      self.$el.bind('hidden.bs.modal', function() {
        Backbone.history.navigate('tasks/' + data.attributes.id, { trigger: true });
      });

      self.modal.hide();
    });

    this.collection.addAndSave({
      title:       this.$("#task-title").val(),
      description: this.$("#task-description").val(),
      projectId:   this.projectId,
      tags:        this.tagFactory.getTagsFrom(this.$("#task_tag_topics, #task_tag_skills, #task_tag_location, #skills-required, #people, #time-required, #time-estimate, #length")),
    });
  },

  cleanup: function() {
    if(this.md)      this.md.cleanup();
    if(this.tagView) this.tagView.cleanup();
    if(this.modal)   this.modal.cleanup();
    removeView(this);
  }

});

module.exports = NewTaskModal;
