
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var TalentView = require('../views/talent_view');


var Talent = BaseController.extend({

  events: {

  },

  initialize: function (options) {
    var self = this;
    this.talentView = new TalentView({
      el: this.el,
    }).render();
  },

  cleanup: function() {
    if (this.talentView) this.talentView.cleanup();
    removeView(this);
  }
});

module.exports = Talent;

