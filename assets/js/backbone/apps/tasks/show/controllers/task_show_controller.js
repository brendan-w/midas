
var         _ = require('underscore');
var Bootstrap = require('bootstrap');
var  Backbone = require('backbone');
var     utils = require('../../../../mixins/utilities');
var  UIConfig = require('../../../../config/ui.json');
var  BaseView = require('../../../../base/base_view');

var          TaskItemView = require('../views/task_item_view');
var ApplicationSelectView = require('../../../application/select/views/application_select_view');


var TaskShowController = BaseView.extend({

  initialize: function (options) {
    var self = this;
    this.options = options;
    this.action = options.action;

    //TODO: handle these errors, if they aren't already handled by the Global AJAX Error Listener
    this.model.fetch({
      success: function() {
        self.render();
      },
    });
  },

  render: function() {
    if (this.taskItemView)      this.taskItemView.cleanup();
    if (this.applicationSelect) this.applicationSelect.cleanup();

    if(this.action == "select")
    {
      this.applicationSelectView = new ApplicationSelectView({
        el:     this.el,
        model:  this.model,
        action: this.action,
      }).render();
    }
    else
    {
      this.taskItemView = new TaskItemView({
        el:     this.el,
        model:  this.model,
        action: this.action,
      }).render();
    }
  },

  cleanup: function () {
    if (this.taskItemView)      this.taskItemView.cleanup();
    if (this.applicationSelect) this.applicationSelect.cleanup();
    removeView(this);
  }

});

module.exports = TaskShowController;
