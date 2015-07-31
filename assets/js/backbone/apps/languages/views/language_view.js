
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var TagFactory     = require('../../../components/tag_factory');
var LanguageTemplate = require('../templates/language_template.html');


var Languages = Backbone.View.extend({

  events: {},

  initialize: function() {
    var self = this;
  },

  render: function(target) {

    this.$el.html(_.template(LanguageTemplate)({
      //nothing so far...
    }));

    this.$el.i18n();

    return this;
  },

  cleanup: function() {
    removeView(this);
  }

});

module.exports = Languages;
