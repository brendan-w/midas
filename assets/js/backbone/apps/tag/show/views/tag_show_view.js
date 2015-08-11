
var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
// var async = require('async');
// var ModalComponent = require('../../../../components/modal');
// var TagConfig = require('../../../../config/tag');
// var TagTemplate = require('../templates/tag_item_template.html');
// var TagShowTemplate = require('../templates/tag_show_template.html');
var TagFactory = require('../../../../components/tag_factory');


var TagShowView = Backbone.View.extend({

  events: {
    // "click .tag-delete"     : "deleteTag"
  },

  /*
    @param {Object}        options
    @param {Array[Object]} options.tags     - array of currently selected tags
    @param {Boolean}       options.edit     - whether or not to display the tag editor
    @param {String}        options.target   - key for looking up tag-type sets from the TagConfig (profile|task|project)

    This view is simply for initializing select2 tag dropdowns.
    It looks for the following element IDs:

      #tag_location
      #tag_task_type
      #tag_education
      #tag_experience
      #tag_work_location
      #tag_relocate
      #tag_fellowship
      #tag_skills
      #tag_topics

    If it finds any of these, it will instantiate select2 with
    the corresponding settings for that tag dropdown. Initial tag
    data can be provided in bulk using `options.tags`. Inversley,
    the tag data can be retrived in bulk using this view's `data`
    function.
  */
  initialize: function (options) {
    this.options = options;
    this.edit    = options.edit;
    this.tags    = options.tags || [];
    this.target  = options.target;
    this.tagFactory = new TagFactory();

    //pre-select all possible elements
    this.$location      = this.$("#tag_location");
    this.$task_type     = this.$("#tag_task_type");
    this.$education     = this.$("#tag_education");
    this.$experience    = this.$("#tag_experience");
    this.$work_location = this.$("#tag_work_location");
    this.$relocate      = this.$("#tag_relocate");
    this.$fellowship    = this.$("#tag_fellowship");
    this.$skills        = this.$("#tag_skills");
    this.$topics        = this.$("#tag_topics");
  },

  render: function () {
    if(this.edit)
      this.initializeSelect2();
    else
      this.initializeDisplay();

    return this;
  },

  initializeSelect2: function () {
    var self = this;

    this.tagFactory.createTagDropDown({
      type:        "location",
      selector:    self.$location,
      multiple:    false,
      data:        self.tagsFor("location"),
    });

    this.tagFactory.fetchAllTagsOfType("task-type", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "task-type",
        selector:    self.$task_type,
        placeholder: "Click to select work types",
        multiple:    true,
        allowCreate: false,
        fillWith:    tags,
        data:        self.tagsFor("task-type"),
      });
    });

    this.tagFactory.fetchAllTagsOfType("education", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "education",
        selector:    self.$education,
        placeholder: "Select an education level",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        fillWith:    tags,
        width:       "250px",
        data:        self.tagsFor("education"),
      });
    });

    this.tagFactory.fetchAllTagsOfType("experience", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "experience",
        selector:    self.$experience,
        placeholder: "Select an experience level",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        fillWith:    tags,
        width:       "250px",
        data:        self.tagsFor("experience"),
      });
    });

    this.tagFactory.fetchAllTagsOfType("work-location", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "work-location",
        selector:    self.$work_location,
        placeholder: "Select a work location preference",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        fillWith:    tags,
        width:       "250px",
        data:        self.tagsFor("work-location"),
      });
    });

    this.tagFactory.fetchAllTagsOfType("relocate", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "relocate",
        selector:    self.$relocate,
        placeholder: "Select relocation preference",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        fillWith:    tags,
        width:       "250px",
        data:        self.tagsFor("relocate"),
      });
    });

    this.tagFactory.fetchAllTagsOfType("fellowship", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "fellowship",
        selector:    self.$fellowship,
        placeholder: "Select fellowship preference",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        fillWith:    tags,
        width:       "250px",
        data:        self.tagsFor("fellowship"),
      });
    });


    self.tagFactory.createTagDropDown({
      type:            "skill",
      selector:        self.$skills,
      tokenSeparators: [","],
      multiple:        true,
      allowCreate:     true,
      data:            self.tagsFor("skill"),
    });

    this.tagFactory.fetchAllTagsOfType("topic", function(tags) {
      self.tagFactory.createTagDropDown({
        type:            "topic",
        selector:        self.$topics,
        tokenSeparators: [","],
        multiple:        true,
        allowCreate:     true,
        fillWith:        tags,
        data:            self.tagsFor("topic"),
      });
    });


    // self.model.trigger("profile:input:changed");
  },

  initializeDisplay: function() {
    this.$location.html(      this.tagStringFor("location")      );
    this.$task_type.html(     this.tagStringFor("task-type")     );
    this.$education.html(     this.tagStringFor("education")     );
    this.$experience.html(    this.tagStringFor("experience")    );
    this.$work_location.html( this.tagStringFor("work-location") );
    this.$relocate.html(      this.tagStringFor("relocate")      );
    this.$fellowship.html(    this.tagStringFor("fellowship")    );
    this.$skills.html(        this.tagStringFor("skill")         );
    this.$topics.html(        this.tagStringFor("topic")         );
  },

  tagsFor: function(tag_type) {
    var tags = _.where(this.tags, { type : tag_type });
    if(tags.length > 0)
      return tags;
    else
      return undefined;
  },

  tagStringFor: function(tag_type) {
    var str = _(this.tags).chain().where({ type : tag_type }).pluck("name").value().join(", ");
    return (str.length === 0) ? "Not specified" : str;
  },

  data: function() {
    return this.tagFactory.getTagsFrom($([
      this.$location,
      this.$task_type,
      this.$education,
      this.$experience,
      this.$work_location,
      this.$relocate,
      this.$fellowship,
      this.$skills,
      this.$topics,
    ]));
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = TagShowView;
