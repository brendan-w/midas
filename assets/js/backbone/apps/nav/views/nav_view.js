// Nav
//
// Note we need to take special care to not open up this view multiple times.
// Bootstrap modals do work with multiple modal opens, and that wouldn't make
// sense anyway. We do that via a variable here (doingLogin) that bypasses
// the render here, and is reset by a callback when the modal closes later.

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var UIConfig = require('../../../config/ui.json');
var Login = require('../../../config/login.json');
var NavTemplate = require('../templates/nav_template.html');


var NavView = Backbone.View.extend({

  events: {
    'click #banner a'       : linkBackbone,
    'click .navbar-brand'   : linkBackbone,
    'click .nav-link'       : linkBackbone,
    'click .login'          : 'loginClick',
    'click .logout'         : 'logout'
  },

  initialize: function (options) {
    var self = this;
    this.options = options;

    this.listenTo(window.cache.userEvents, "user:login:success", function (userData) {
      self.render();
    });

    this.listenTo(window.cache.userEvents, "user:login:close", function () {
      self.doingLogin = false;
    });

    this.listenTo(window.cache.userEvents, "user:logout", function () {
      self.render();
      Backbone.history.loadUrl();
      window.cache.userEvents.trigger("user:logout:success");
    });

    // update the navbar when the profile changes
    this.listenTo(window.cache.userEvents, "user:profile:save", function (data) {
      // reset the currentUser object
      window.cache.currentUser = data;
      // re-render the view
      self.render();
    });

    // update the user's photo when they change it
    this.listenTo(window.cache.userEvents, "user:profile:photo:save", function (url) {
      $(".navbar-people").attr('src', url);
    });
  },

  render: function () {

    this.$el.html(_.template(NavTemplate)({
      user:       window.cache.currentUser,
      systemName: window.cache.system.name,
      login:      Login,
      ui:         UIConfig,
    }));

    this.$el.i18n();

    //highlight the current link
    var href = window.location.pathname;
    $('nav.main .nav-link')
      .closest('li')
      .removeClass('active');
    $('nav.main .nav-link[href="' + href + '"]')
      .closest('li')
      .addClass("active");

    return this;
  },

  loginClick: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.login();
  },

  login: function (message) {
    window.cache.userEvents.trigger("user:request:login");
  },

  logout: function (e) {
    if (e.preventDefault) e.preventDefault();
    $.ajax({
      url: '/api/auth/logout?json=true',
    }).done(function (success) {
      window.cache.currentUser = null;
      window.cache.userEvents.trigger("user:logout");
    }).fail(function (error) {
      // do nothing
    });
  },

  cleanup: function () {
    removeView(this);
  }
});

module.exports = NavView;
