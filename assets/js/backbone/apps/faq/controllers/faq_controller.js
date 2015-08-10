
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var FaqView = require('../views/faq_view');


var Faq = BaseController.extend({

  events: {

  },

  // The initialize method is mainly used for event bindings (for efficiency)
  initialize: function (options) {
    var self = this;
    this.faqView = new FaqView({
      el: this.el,
    }).render();
  },

  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function() {
    if (this.faqView) this.faqView.cleanup();
    removeView(this);
  }

});

module.exports = Faq;

