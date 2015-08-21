var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var BaseView = require('../../../../base/base_view');

var ApplicationSelectTemplate = require('../templates/application_select_template.html');
var ApplicationSelectTemplate = require('../templates/application_select_template.html');



var ApplicationSelectView = BaseView.extend({

  events: {
    'click #accept-applicants' : 'accept',
    'click .link-backbone'     : linkBackbone,
  },

  initialize: function (options) {
    var self = this;
    this.options = options;
    this.action  = options.action;


  },

  render: function() {
    var self = this;
    //TODO: show a loading icon

    //fetch the applicants for this job
    $.ajax({
      url: "/api/application/findApplicantsForTask/" + this.model.get("id"),
      type: "GET",
      success: function(applications) {
        self.render_applicants(applications);
      },
    });

    return this;
  },

  render_applicants: function(applications) {

    var data = {
      applications: applications,
      task: this.model.toJSON(),
      user:  window.cache.currentUser,
      ui:    UIConfig,
    };

    this.$el.html(_.template(ApplicationSelectTemplate)(data));
    this.$el.i18n();
  },

  accept: function(e) {
    if (e && e.preventDefault) e.preventDefault();

    var applications = [];

    //build up a list of IDs for the selected applicants
    this.$("li.application").each(function(i, application) {
      var $application = $(application);
      var selected = $application.find(".applicant-select").is(":checked");
      if(selected)
        applications.push($application.data("id"));
    });

    console.log(applications);
  },

  cleanup: function () {
    removeView(this);
  },

});

module.exports = ApplicationSelectView;
