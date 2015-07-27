
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
    /*
    function resizeElements() {
      headerHeight = $('.navbar').height();
      footerHeight = $('footer').height();
      if (($(document.body).height() + footerHeight) < $(window).height()) {
        self.$el.addClass('navbar-fixed-bottom');
      } else {
        self.$el.removeClass('navbar-fixed-bottom');
      }
    }
    resizeElements();
    $(".container").bind("DOMSubtreeModified", resizeElements);
    */
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = FooterView;

