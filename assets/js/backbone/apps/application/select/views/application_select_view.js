var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var BaseView = require('../../../../base/base_view');

var ApplicationSelectTemplate = require('../templates/application_select_template.html');
var ApplicationSelectTemplate = require('../templates/application_select_template.html');



var ApplicationSelectView = BaseView.extend({

  events: {
    'click .link-backbone' : linkBackbone,
  },

  initialize: function (options) {
    var self = this;
    this.options = options;
    this.action  = options.action;


  },

  render: function() {

    //show loading icon

    $.ajax({
      url: "/api/application/findApplicantsForTask/" + this.model.get("id"),
      type: "GET",
      success: this.render_applicants,
    });

    return this;
  },

  render_applicants: function(applications) {
    console.log(applications);
    return;
    var data = {
      // applications: this.model.get("applications"),
      // model: this.model.toJSON(),
      user:  window.cache.currentUser,
      ui:    UIConfig,
    };

    this.$el.html(_.template(ApplicationSelectTemplate)(data));
    this.$el.i18n();

  },

  cleanup: function () {
    removeView(this);
  },

});

module.exports = ApplicationSelectView;
