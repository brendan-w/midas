var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var AboutTemplate = require('../templates/about_template.html');


var AboutView = Backbone.View.extend({

  events: {

  },

  initialize: function (options) {
    var self = this;
    this.options = options;

    self.render();
  },

  render: function () {
    this.$el.html(_.template(AboutTemplate)({
    }));

    return this;
  },

  cleanup: function () {
    removeView(this);
  }
});

module.exports = AboutView;
