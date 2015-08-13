var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var TalentTemplate = require('../templates/talent_template.html');


var TalentView = Backbone.View.extend({

  events: {

  },

  initialize: function (options) {
    var self = this;
    this.options = options;
  },

  render: function () {
    this.$el.html(_.template(TalentTemplate)({
    }));
    console.log("STUFF");
    return this;
  },

  cleanup: function () {
    removeView(this);
  }
});

module.exports = TalentView;
