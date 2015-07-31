
var _         = require('underscore');
var Backbone  = require('backbone');
var Utilities = require('../../../../mixins/utilities');
var Bootstrap = require('bootstrap');

var TasksCollection    = require('../../../../entities/tasks/tasks_collection');
var TaskCollectionView = require('../views/task_collection_view');
var NewTaskModal       = require('../../../tasks/new/views/new_task_modal');


TaskList = Backbone.View.extend({

  el: "#task-list-wrapper",

  events: {
    'click .add-task' : 'add',
    'click .show-task': 'show',
    'click .task'     : 'show',
    'click .wizard'   : 'wizard'
  },

  /*
    @param {Object}  settings
    @param {Integer} settings.projectId
  */
  initialize: function (settings) {
    this.options = _.extend(settings, this.defaults);
    var self = this;

    this.initializeTaskCollectionInstance();
    this.requestTasksCollectionData();

    this.collection.on("tasks:render", function () {
      self.requestTasksCollectionData()
    })
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
        self.collection = collection;
        self.renderTaskCollectionView()
      }
    });
  },

  renderTaskCollectionView: function () {
    var self = this;

    if (this.taskCollectionView) this.taskCollectionView.cleanup();
    this.taskCollectionView = new TaskCollectionView({
      el: "#task-list-wrapper",
      onRender: true,
      collection: self.collection
    });
  },

  add: function (e) {
    if (e.preventDefault) e.preventDefault();

    if (this.newTaskModal) this.newTaskModal.cleanup();
    this.newTaskModal = new NewTaskModal({
      el: "#addTask-wrapper",
      collection: this.collection,
      projectId: this.options.projectId,
    }).render();
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
