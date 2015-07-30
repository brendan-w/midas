var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var LoginPasswordView = require('./login_password_view');
var LoginTemplate = require('../templates/login_template.html');


var LoginView = Backbone.View.extend({

  events: {
    'click .oauth-link'              : 'link',
    'submit #login-password-form'    : 'submitLogin',
    'submit #registration-form'      : 'submitRegister',
    'submit #forgot-form'            : 'submitForgot'
  },

  initialize: function (options) {
    this.options = options;
  },

  render: function () {
    var self = this;
    var data = {
      login: this.options.login,
      message: this.options.message
    };
    var template = _.template(LoginTemplate)(data);
    this.$el.html(template);
    this.$el.i18n();
    this.loginPasswordView = new LoginPasswordView({
      el: this.$(".password-view")
    }).render();
    setTimeout(function () {
      self.$("#username").focus();
    }, 500);
    return this;
  },

  link: function (e) {
    if (e.preventDefault) e.preventDefault();
    var link = $(e.currentTarget).attr('href');
    window.location.href = link;
  },

  v: function (e) {
    return validate(e);
  },

  submitLogin: function (e) {
    var self = this;
    if (e.preventDefault) e.preventDefault();
    var data = {
      identifier: this.$("#username").val(),
      password: this.$("#password").val(),
      json: true
    };
    $.ajax({
      url: '/api/auth/local',
      type: 'POST',
      data: data
    }).done(function (success) {
      // Set the user object and trigger the user login event
      window.cache.currentUser = success;
      window.cache.userEvents.trigger("user:login", success);
    }).fail(function (error) {
      var d = JSON.parse(error.responseText);
      self.$("#login-error").html(d.message);
      self.$("#login-error").show();
    });
  },

  submitForgot: function (e) {
    var self = this;
    if (e.preventDefault) e.preventDefault();
    var data = {
      username: this.$("#fusername").val()
    };
    // Post the registration request to the server
    $.ajax({
      url: '/api/auth/forgot',
      type: 'POST',
      data: data
    }).done(function (success) {
      // Set the user object and trigger the user login event
      self.$("#forgot-view").hide();
      self.$("#forgot-footer").hide();
      self.$("#forgot-done-view").show();
      self.$("#forgot-done-footer").show();
    }).fail(function (error) {
      var d = JSON.parse(error.responseText);
      self.$("#forgot-error").html(d.message);
      self.$("#forgot-error").show();
    });
  },

  clickUsername: function (e) {
    e.preventDefault();
  },

  cleanup: function () {
    if (this.loginPasswordView) { this.loginPasswordView.cleanup(); }
    removeView(this);
  },
});

module.exports = LoginView;
