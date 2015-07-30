
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

var LoginPasswordView = Backbone.View.extend({

  events: {
    'keyup #rname'             : 'checkName',
    'change #rname'            : 'checkName',
    'blur #rname'              : 'checkName',

    'keyup #rusername'         : 'checkUsername',
    'change #rusername'        : 'checkUsername',
    'click #rusername-button'  : 'clickUsername',
  },

  initialize: function (options) {
    this.options = options;
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

module.exports = LoginPasswordView;

