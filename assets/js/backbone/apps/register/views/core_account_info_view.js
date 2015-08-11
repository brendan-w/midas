
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var login    = require('../../../config/login.json');

var PasswordControl     = require('./password_control');
var CoreAccountTemplate = require('../templates/core_account_info.html');


/*
  This is a view for a single modal page that carries the bare minimum
  requirements for creating an account.

  Real Name
  Email (username)
  Password
*/

var CoreAccountView = Backbone.View.extend({

  events: {
    'keyup  #rname'            : 'checkName',
    'change #rname'            : 'checkName',
    'blur   #rname'            : 'checkName',

    'keyup  #rusername'        : 'checkUsername',
    'change #rusername'        : 'checkUsername',
    'click  #rusername-button' : 'clickUsername',
  },

  initialize: function (options) {
    this.options = options;
    this.account_type = options.type;
  },

  render: function () {
    if(this.password) this.password.cleanup();

    //load the main template
    this.$el.html(_.template(CoreAccountTemplate)({
      login:login,
    }));

    //load the password field
    this.password = new PasswordControl({
      el: ".password-view",
    }).render();

    return this;
  },

  submit: function(user_data, cb) {
    if(!user_data.type)
      return console.log("Must pass a user type string to submit()");

    // Create a data object with the required fields
    var data = {
      json:     true,
      name:     this.$("#rname").val(),
      username: this.$("#rusername").val(),
      password: this.$("#rpassword").val(),
    };

    //load any additional values (including the `type`)
    _.extend(data, user_data);

    // Add in additional, optional fields
    if(login.terms.enabled === true)
      data['terms'] = (this.$("#rterms").val() == "on");

    // Post the registration request to the server
    $.ajax({
      url: '/api/auth/local/register',
      type: 'POST',
      data: data
    }).done(function (user) {
      // Set the user object and trigger the user login event
      window.cache.currentUser = user;
      cb(user);
    }).fail(function (error) {
      //TODO: handle these errors, if they aren't already handled
      //      by the Global AJAX Error listener
      /*
      var d = JSON.parse(error.responseText);
      self.$("#registration-error").html(d.message);
      self.$("#registration-error").show();
      $submitButton.prop('disabled', false);
      */
    });
  },

  checkName: function (e) {
    var name = this.$("#rname").val();
    if (name && name !== '') {
      $("#rname").closest(".form-group").find(".help-block").hide();
    } else {
      $("#rname").closest(".form-group").find(".help-block").show();
    }
  },

  checkUsername: function (e) {
    var username = $("#rusername").val();

    //the password field will check that it does not contain the username
    this.password.checkAgainstUsername(username);
    
    $.ajax({
      url: '/api/user/username/' + username,
    }).done(function (data) {
      $("#rusername-button").removeClass('btn-success');
      $("#rusername-button").removeClass('btn-danger');
      $("#rusername-check").removeClass('fa fa-check');
      $("#rusername-check").removeClass('fa fa-times');
      if (data) {
        // username is taken
        $("#rusername-button").addClass('btn-danger');
        $("#rusername-check").addClass('fa fa-times');
      } else {
        // username is available
        $("#rusername-button").addClass('btn-success');
        $("#rusername-check").addClass('fa fa-check');
        $("#rusername").closest(".form-group").removeClass('has-error');
        $("#rusername").closest(".form-group").find(".help-block").hide();
      }
    });
  },

  cleanup: function () {
    if(this.password) this.password.cleanup();
    removeView(this);
  },
});

module.exports = CoreAccountView;

