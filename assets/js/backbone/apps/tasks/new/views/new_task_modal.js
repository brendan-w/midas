var _         = require('underscore');
var async     = require('async');
var Backbone  = require('backbone');
var Bootstrap = require('bootstrap');
var utilities = require('../../../../mixins/utilities');

var ModalView       = require('../../../../components/modal_new');
var MarkdownEditor  = require('../../../../components/markdown_editor');
var NewTaskTemplate = require('../templates/new_task_template.html');
var TagFactory      = require('../../../../components/tag_factory');


var NewTaskModal = Backbone.View.extend({

  events: {
    "change .validate"        : "v",
    "change #task-location" : "locationChange"
  },

  /*
    @param {Object}  options
    @param {Integer} options.projectId   -  optional Id of the parent project
  */
  initialize: function (options) {
    this.options = _.extend(options, this.defaults);

    //ID of the parent project
    //if no projectId is specified, then the tasks created will be orphaned
    this.projectId = options.projectId || null;

    this.data = {};
    this.data.newTag = {};
    this.data.newItemTags = [];
    this.data.existingTags = [];

    this.tagFactory = new TagFactory();
    this.initializeSelect2Data();
  },

  initializeSelect2Data: function () {
    var self = this;

    var types = [
      "task-skills-required",
      "task-time-required",
      "task-people",
      "task-length",
      "task-time-estimate"
    ];

    this.tagSources = {};

    var requestAllTagsByType = function (type) {
      $.ajax({
        url: '/api/ac/tag?type=' + type + '&list',
        type: 'GET',
        async: false,
        success: function (data) {
          self.tagSources[type] = data;
        }
      });
    };

    async.each(types, requestAllTagsByType, function (err) {
      self.render();
    });
  },

  getTagsFromPage: function () {

    // Gather tags for submission after the task is created
    tags = {
      'topic':                  this.$("#task_tag_topics").select2('data'),
      'skill':                  this.$("#task_tagskills").select2('data'),
      'location':               this.$("#task_tag_location").select2('data'),
      'task-skills-required': [ this.$("#skills-required").select2('data') ],
      'task-people':          [ this.$("#people").select2('data') ],
      'task-time-required':   [ this.$("#time-required").select2('data') ],
      'task-time-estimate':   [ this.$("#time-estimate").select2('data') ],
      'task-length':          [ this.$("#length").select2('data') ]
    };

    return tags;
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
      html: _.template(NewTaskTemplate)({ tags: this.tagSources }),
      doneButtonText: 'Post ' + i18n.t('Task'),
    });

    this.initializeSelect2();
    this.initializeTextArea();

    // Important: Hide all non-currently opened sections of wizard.
    this.$("section:not(.current)").hide();

    this.modal.show();

    // Return this for chaining.
    return this;
  },

  v: function (e) {
    return validate(e);
  },

  next: function ($page) {
    return !validateAll($page);
  },

  initializeSelect2: function () {
    var self = this;

    self.tagFactory.createTagDropDown({
      type:"skill",
      selector:"#task_tag_skills",
      width: "100%",
      tokenSeparators: [","],
    });

    self.tagFactory.createTagDropDown({
      type:"topic",
      selector:"#task_tag_topics",
      width: "100%",
      tokenSeparators: [","],
    });

    self.tagFactory.createTagDropDown({
      type:"location",
      selector:"#task_tag_location",
      width: "100%",
      tokenSeparators: [","],
    });

    self.$(".el-specific-location").hide();

    // ------------------------------ //
    // PRE-DEFINED SELECT MENUS BELOW //
    // ------------------------------ //
    self.$("#skills-required").select2({
      placeholder: "Required/Not Required",
      width: 'resolve'
    });

    self.$("#time-required").select2({
      placeholder: 'Time Commitment',
      width: 'resolve'
    });

    self.$("#people").select2({
      placeholder: 'Personnel Needed',
      width: 'resolve'
    });

    self.$("#length").select2({
      placeholder: 'Deadline',
      width: 'resolve'
    });

    self.$("#time-estimate").select2({
      placeholder: 'Estimated Time Required',
      width: 'resolve'
    });

    self.$("#task-location").select2({
      placeholder: 'Work Location',
      width: 'resolve'
    });

  },

  initializeTextArea: function () {
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

  locationChange: function (e) {
    if (_.isEqual(e.currentTarget.value, "true")) {
      this.$(".el-specific-location").show();
    } else {
      this.$(".el-specific-location").hide();
    }
  },

  submit: function($form) {
    var self = this;

    //when the collection add is successful, redirect to the newly created task
    this.listenTo(this.collection, "task:save:success", function (data) {

      // redirect when the modal is fully hidden
      self.$el.bind('hidden.bs.modal', function() {
        Backbone.history.navigate('tasks/' + data.attributes.id, { trigger: true });
      });

      self.modal.hide();
    });

    //parse the tags from the select2 boxes

    var raw_tags = [];
    raw_tags.push.apply(raw_tags,this.$("#task_tag_topics").select2('data'));
    raw_tags.push.apply(raw_tags,this.$("#task_tag_skills").select2('data'));
    raw_tags.push.apply(raw_tags,this.$("#task_tag_location").select2('data'));
    raw_tags.push.apply(raw_tags,[this.$("#skills-required").select2('data')]);
    raw_tags.push.apply(raw_tags,[this.$("#people").select2('data')]);
    raw_tags.push.apply(raw_tags,[this.$("#time-required").select2('data')]);
    raw_tags.push.apply(raw_tags,[this.$("#time-estimate").select2('data')]);
    raw_tags.push.apply(raw_tags,[this.$("#length").select2('data')]);
    
    var tags = _(raw_tags).map(function(tag) {
      return (tag.id && tag.id !== tag.name) ? +tag.id : {
        name: tag.name,
        type: tag.tagType,
        data: tag.data
      };
    });

    this.collection.addAndSave({
      title:       this.$("#task-title").val(),
      description: this.$("#task-description").val(),
      projectId:   this.projectId,
      tags:        tags,
    })
  },


  cleanup: function () {
    if(this.md) { this.md.cleanup(); }
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = NewTaskModal;
