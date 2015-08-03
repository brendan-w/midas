
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
        extra /= 2;
        self.$el.css({ "margin-top": extra + "px" });
        }
    }
    //   var px_in_window = $(window).height() - ($(document.body).height() - self.$el.height());

    //   //peg at zero if the footer is already off screen
    //   px_in_window = Math.max(px_in_window, 0);
    //   self.$el.css({ "margin-top": px_in_window + "px" });
    // }

     resizeElements(); //trigger initial size calculation
     $("#container").bind("DOMSubtreeModified", resizeElements);
     $(window).bind("resize", resizeElements);
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = FooterView;

