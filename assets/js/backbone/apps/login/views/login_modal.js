
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var login = require('../../../config/login.json');


var LoginTemplate      = require('../templates/login_template.html');
var ForgotTemplate     = require('../templates/forgot_template.html');
var ForgotDoneTemplate = require('../templates/forgot_done_template.html');


var LoginView = Backbone.View.extend({

  events: {
  },

  initialize: function (options) {
    this.options = options;
    var self = this;

    //make a persistent ModalView for the register form
    this.modal = new ModalView({
      el: this.el,
    }).render();

    //handle modal events
    this.listenTo(this.modal, "submit", this.submit);


    //listen for login events
    this.listenTo(window.cache.userEvents, "user:request:login", function (message) {
      // trigger the login modal IF we're logged out
      if (window.cache.currentUser)
        Backbone.history.navigate(UIConfig.home.logged_in_path, { trigger: true });
      else
        self.gotoLoginForm(message);
    });

    // clean up no matter how the modal is closed
    self.$el.bind('hidden.bs.modal', function () {
      window.cache.userEvents.trigger("user:login:close");
    });
  },

  /*
    the current `target`s are:
      "login"            <-- default
      "forgot"
      "forgot:done"
  */
  render: function (target, message) {
    var self = this;
    this.target = target || "login";

    var template;
    var template_data = {
      login: login,
      message: message
    };

    //load the requested register form
    switch(this.target)
    {
      case "login":       template = _.template(LoginTemplate);      break;
      case "forgot":      template = _.template(ForgotTemplate);     break;
      case "forgot:done": template = _.template(ForgotDoneTemplate); break;
    }

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: template(template_data),
      doneButtonText: "Login",
      hideButtons: (this.target == "forgot:done"),
    });

    this.modal.show();

    setTimeout(function () {
      self.$("#username").focus();
    }, 500);

    return this;
  },

  gotoLoginForm: function(message) {
    this.render("login", message);
  },

  gotoForgotForm: function(message) {
    this.render("forgot", message);
  },

  submit: function() {
    switch(this.target)
    {
      case "login":  this.submitLogin();  break;
      case "forgot": this.submitForgot(); break;
    }
  },




  submitLogin: function (e) {
    var self = this;
    if (e && e.preventDefault) e.preventDefault();
    var data = {
      identifier: this.$("#username").val(),
      password: this.$("#password").val(),
      json: true
    };
    $.ajax({
      url: '/api/auth/local',
      type: 'POST',
      data: data
    }).done(function (user) {
      // Set the user object and trigger the user login event
      window.cache.currentUser = user;

      self.$el.bind('hidden.bs.modal', function() {
        // if successful, reload page
        Backbone.history.loadUrl();
        window.cache.userEvents.trigger("user:login:success", user);
        if (self.options.navigate) {
          window.cache.userEvents.trigger("user:login:success:navigate", user);
        }
      });

      self.modal.hide();

      // window.cache.userEvents.trigger("user:login", success);

    }).fail(function (error) {
      var d = JSON.parse(error.responseText);
      self.$("#login-error").html(d.message);
      self.$("#login-error").show();
    });
  },

  submitForgot: function (e) {
    var self = this;
    if (e && e.preventDefault) e.preventDefault();
    var data = {
      username: this.$("#fusername").val()
    };
    // Post the registration request to the server
    $.ajax({
      url: '/api/auth/forgot',
      type: 'POST',
      data: data
    }).done(function (success) {
      self.gotoLoginForm();
    }).fail(function (error) {
      //TODO: handle these errors
      var d = JSON.parse(error.responseText);
      self.$("#forgot-error").html(d.message);
      self.$("#forgot-error").show();
    });
  },

  cleanup: function () {
    if(this.modal) this.modal.cleanup();
    removeView(this);
  },
});

module.exports = LoginView;
