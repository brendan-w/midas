var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var ModalComponent = require('../../../components/modal');
var AdminDashboardTemplate = require('../templates/admin_dashboard_template.html');
var AdminDashboardTable = require('../templates/admin_dashboard_table.html');
var AdminDashboardTasks = require('../templates/admin_dashboard_task_metrics.html');
var AdminDashboardActivities = require('../templates/admin_dashboard_activities.html');
var LoginConfig = require('../../../config/login.json');
var marked = require('marked');


var AdminDashboardView = Backbone.View.extend({

  events: {
  },

  initialize: function (options) {
    this.options = options;
    this.data = {
      page: 1
    };
  },

  render: function () {
    var self = this;
    Backbone.history.navigate('/admin/dashboard');
    this.$el.show();
    if (this.rendered === true) {
      return this;
    }
    var data = {
      user: window.cache.currentUser,
      login: LoginConfig
    };
    var template = _.template(AdminDashboardTemplate)(data);
    this.$el.html(template);
    this.rendered = true;
    // fetch data
    this.fetchData(self, this.data);
    return this;
  },

  renderMetrics: function (self, data) {
    var template = _.template(AdminDashboardTable)(data);
    self.$(".metric-block").html(template);
    this.$el.i18n();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".metric-block").show();
  },

  renderTasks: function(self, data) {
    var template = _.template(AdminDashboardTasks)(data);
    self.$(".task-metrics").html(template);
    this.$el.i18n();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".task-metrics").show();
  },

  renderActivities: function (self, data) {
    var template = _.template(AdminDashboardActivities);
    self.$(".activity-block").html(template);
    _(data).forEach(function(activity) {

      // If activity is missing data, skip it
      if (!activity || !activity.user ||
        (activity.type === 'newVolunteer' && !activity.task) ||
        (activity.comment && typeof activity.comment.value === "undefined")
       ) return;

      // Render markdown
      if (activity.comment) {
        var value = activity.comment.value;

        value = marked(value, { sanitize: false });
        //render comment in single line by stripping the markdown-generated paragraphs
        value = value.replace(/<\/?p>/gm, '');
        value = value.replace(/<br>/gm, '');
        value = value.trim();

        activity.comment.value = value;
      }
      // Format timestamp
      activity.createdAtFormatted = $.timeago(activity.createdAt);
      var template = self.$('#' + activity.type).text(),
          content = _.template(template, { interpolate: /\{\{(.+?)\}\}/g })(activity);
      self.$('.activity-block .activity-feed').append(content);
    });

    this.$el.i18n();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".activity-block").show();
  },

  fetchData: function (self, data) {
    $.ajax({
      url: '/api/admin/metrics',
      dataType: 'json',
      success: function (data) {
        self.data = data;
        $.ajax({
          url: '/api/admin/interactions',
          dataType: 'json',
          success: function(interactions) {
            data.interactions = interactions;
            interactions.count = _(interactions).reduce(function(sum, value, key) {
              return sum + value;
            }, 0);
            self.renderMetrics(self, data);
          }
        });
        $.ajax({
          url: '/api/admin/taskmetrics',
          dataType: 'json',
          success: function (data) {
            data.tasks.active = self.data.tasks;
            self.renderTasks(self, data);
          }
        });
      }
    });
    $.ajax({
      url: '/api/admin/activities',
      dataType: 'json',
      success: function (data) {
        self.renderActivities(self, data);
      }
    });
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminDashboardView;
