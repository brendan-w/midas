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

    console.log(this.model);
  },

  render: function() {

    var data = {
      applications: this.model.get("applications"),
      // model: this.model.toJSON(),
      user:  window.cache.currentUser,
      ui:    UIConfig,
    };

    this.$el.html(_.template(ApplicationSelectTemplate)(data));
    this.$el.i18n();

    return this;
  },

  cleanup: function () {
    removeView(this);
  },

});

module.exports = ApplicationSelectView;
