
var _ = require('underscore');
var Backbone = require('backbone');
var Utilities = require('../../../../mixins/utilities');
var Bootstrap = require('bootstrap');
var TasksCollection = require('../../../../entities/tasks/tasks_collection');
var TaskCollectionView = require('../views/task_collection_view');

var NewTaskModal = require('../../../tasks/new/views/new_task_modal');

var ModalWizardComponent = require('../../../../components/modal_wizard');
var TaskModel = require('../../../../entities/tasks/task_model');

TaskList = Backbone.View.extend({

  el: "#task-list-wrapper",

  events: {
    'click .add-task' : 'add',
    'click .show-task': 'show',
    'click .task'     : 'show',
    'click .wizard'   : 'wizard'
  },

  initialize: function (settings) {
    this.options = _.extend(settings, this.defaults);
    var self = this;

    this.initializeTaskCollectionInstance();
    this.initializeTaskModelInstance();
    this.initializeListeners();
    this.requestTasksCollectionData();

    this.collection.on("tasks:render", function () {
      self.requestTasksCollectionData()
    })
  },

  initializeListeners: function() {
    var self = this;
    this.listenTo(this.taskModel, 'task:tags:save:success', function () {
      self.initializeTaskModelInstance();
      self.requestTasksCollectionData();
    });
  },

  initializeTaskModelInstance: function () {
    this.taskModel = new TaskModel();
  },

  initializeTaskCollectionInstance: function () {
    if (this.collection) {
      this.collection.initialize();
    } else {
      this.collection = new TasksCollection();
    }
  },

  requestTasksCollectionData: function () {
    var self = this;

    this.collection.fetch({
      url: '/api/task/findAllByProjectId/' + parseInt(this.options.projectId),
      success: function (collection) {
        self.tasks = collection;
        self.renderTaskCollectionView()
      }
    });
  },

  renderTaskCollectionView: function () {
    var self = this;

    this.listenTo(this.collection, "task:save:success", function (model) {
      self.requestTasksCollectionData();
    });

    if (this.taskCollectionView) this.taskCollectionView.cleanup();
    this.taskCollectionView = new TaskCollectionView({
      el: "#task-list-wrapper",
      onRender: true,
      collection: self.tasks
    });
  },

  add: function (e) {
    if (e.preventDefault) e.preventDefault();

    if (this.newTaskModal) this.newTaskModal.cleanup();
    this.newTaskModal = new NewTaskModal({
      el: "#addTask-wrapper",
      collection: this.collection,
    }).render();

    /*
    var self = this;

    if (this.taskFormView) this.taskFormView.cleanup();
    if (this.modalWizardComponent) this.modalWizardComponent.cleanup();
    this.modalWizardComponent = new ModalWizardComponent({
      el: ".wrapper-addTask",
      id: "addTask",
      modalTitle: 'New ' + i18n.t('Opportunity'),
      model: self.taskModel,
      collection: self.tasks,
      modelName: 'task',
      data: function (parent) { return {
        title: parent.$("#task-title").val(),
        description: parent.$("#task-description").val(),
        projectId: self.options.projectId,
        tags: getTags()
      } }
    }).render();

    this.taskFormView = new TaskFormView({
      el: ".modal-body",
      projectId: this.options.projectId,
      model: self.taskModel,
      tasks: self.tasks
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
    */
  },

  show: function (e) {
    if (e.preventDefault) e.preventDefault();
    var projectId = $(e.currentTarget).data('projectid'),
        taskId    = $(e.currentTarget).data('id');

    if (taskId == 'null') { return; }

    Backbone.history.navigate('tasks/' + taskId, { trigger: true }, taskId);
  },

  cleanup: function () {
    if (this.newTaskModal) this.newTaskModal.cleanup();
    if (this.taskCollectionView) this.taskCollectionView.cleanup();
    removeView(this);
  }

});

module.exports = TaskList;
