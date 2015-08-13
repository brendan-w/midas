
var         _ = require('underscore');
var Bootstrap = require('bootstrap');
var  Backbone = require('backbone');
var     utils = require('../../../../mixins/utilities');
var  UIConfig = require('../../../../config/ui.json');
var  BaseView = require('../../../../base/base_view');

var TaskItemView = require('../views/task_item_view');


var TaskShowController = BaseView.extend({

  el: "#container",

  initialize: function (options) {
    var self = this;
    this.options = options;

    this.listenTo(this.model, "sync", this.render);

    //TODO: handle these errors, if they aren't already handled by the Global AJAX Error Listener
    // this.listenTo(this.model, "error", function() {
    // });

    this.model.fetch();

  },

  render: function() {
    //compile the view
    if (this.taskItemView) this.taskItemView.cleanup();
    this.taskItemView = new TaskItemView({
      el:     this.el,
      model:  this.options.model,
      action: this.options.action,
      // router: this.options.router,
    });
  },

  cleanup: function () {
    if (this.taskItemView) this.taskItemView.cleanup();
    removeView(this);
  }

});

module.exports = TaskShowController;
