var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var UIConfig = require('../../../config/ui.json');
var Login = require('../../../config/login.json');

//templates
var Templates = {
  "about"   : require("../templates/about.html"),
  "faq"     : require("../templates/faq.html"),
  "terms"   : require("../templates/terms.html"),
  "privacy" : require("../templates/privacy.html"),
};


var StaticView = Backbone.View.extend({

  /*
    @param {String} options.page   -   The filename of the template to be rendered
  */
  initialize: function(options) {
    var self = this;
    this.options = options;
    this.page    = options.page;
    self.render();
  },

  render: function() {

    if(Templates[this.page])
    {
      this.$el.html(_.template(Templates[this.page])({
        ui:    UIConfig,
        login: Login,
      }));
    }
    else
    {
      this.$el.html("Template not found");
    }

    this.$el.i18n();

    return this;
  },

  cleanup: function() {
    removeView(this);
  }
});

module.exports = StaticView;
