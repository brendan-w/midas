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
