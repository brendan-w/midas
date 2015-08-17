
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var Login = require('../../../config/login.json');
var FooterTemplate = require('../templates/footer_template.html');


var FooterView = Backbone.View.extend({

  events: {
  },

  render: function () {
    var self = this;
    var data = {
      version: version,
      login: Login
    };
    var compiledTemplate = _.template(FooterTemplate)(data);
    this.$el.html(compiledTemplate);

    function resizeElements() {
      if ($(window).height() > $('body').height())
      {
        var extra = $(window).height() - $('body').height();
        extra /= 4;
        self.$el.css({ "margin-top": extra + "px" });
      }
    }

    resizeElements(); //trigger initial size calculation
    $("#container").bind("DOMSubtreeModified", resizeElements);
    $(window).bind("resize", resizeElements);
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = FooterView;

