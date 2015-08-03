var _ = require('underscore');
var Backbone = require('backbone');
var Bootstrap = require('bootstrap');
var utils = require('../../../../mixins/utilities');
var BaseView = require('../../../../base/base_view');

var VetShowTemplate = require('../templates/vet_show_template.html');

var VetShowView = BaseView.extend({

  initialize: function(options) {
    this.options = options;
  },

  render: function() {
    this.$el.html(_.template(VetShowTemplate)({
      
    }));
    this.$el.i18n();
  },

  cleanup: function() {
    removeView(this);
  }
});

module.exports = VetShowView;
