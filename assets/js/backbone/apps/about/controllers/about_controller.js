
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var AboutView = require('../views/about_view');


var About = BaseController.extend({

  events: {

  },

  initialize: function (options) {
    var self = this;
    this.aboutView = new AboutView({
      el: this.el,
    }).render();
  },

  cleanup: function() {
    if (this.aboutView) this.aboutView.cleanup();
    removeView(this);
  }

});

module.exports = About;

