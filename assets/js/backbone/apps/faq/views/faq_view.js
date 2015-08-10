// Nav
//
// Note we need to take special care to not open up this view multiple times.
// Bootstrap modals do work with multiple modal opens, and that wouldn't make
// sense anyway. We do that via a variable here (doingLogin) that bypasses
// the render here, and is reset by a callback when the modal closes later.

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var FaqTemplate = require('../templates/faq_template.html');


var FaqView = Backbone.View.extend({

  events: {

  },

  initialize: function (options) {
    var self = this;
    this.options = options;

    self.render();
  },

  render: function () {
    this.$el.html(_.template(FaqTemplate)({
    }));

    return this;
  },

  cleanup: function () {
    removeView(this);
  }
});

module.exports = FaqView;
