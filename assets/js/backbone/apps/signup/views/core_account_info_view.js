
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var login    = require('../../../config/login.json');

var CoreAccountTemplate = require('../templates/core_account_info.html');


/*
  This is a view for a single modal page that carries the bare minimum
  requirements for creating an account.

  Name
  Email
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

    'keyup #rpassword'         : 'checkPassword',
    'blur #rpassword'          : 'checkPassword',
    'keyup #rpassword-confirm' : 'checkPasswordConfirm',
    'blur #rpassword-confirm'  : 'checkPasswordConfirm',
  },

  initialize: function (options) {
    this.options = options;
  },

  render: function () {
    var template = _.template(CoreAccountTemplate)({
      login:login,
    });
    this.$el.html(template);
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

  checkPassword: function (e) {
    var rules = validatePassword(this.$("#rusername").val(), this.$("#rpassword").val());
    var valuesArray = _.values(rules);
    var validRules = _.every(valuesArray);
    var success = true;
    if (validRules === true) {
      $("#rpassword").closest(".form-group").removeClass('has-error');
      $("#rpassword").closest(".form-group").find(".help-block").hide();
    }
    _.each(rules, function (value, key) {
      if (value === true) {
        this.$(".password-rules .success.rule-" + key).show();
        this.$(".password-rules .error.rule-" + key).hide();
      } else {
        this.$(".password-rules .success.rule-" + key).hide();
        this.$(".password-rules .error.rule-" + key).show();
      }
      success = success && value;
    });
    return success;
  },

  checkPasswordConfirm: function (e) {
    var success = true;
    var password = this.$("#rpassword").val();
    var confirm = this.$("#rpassword-confirm").val()
    if (password === confirm) {
      $("#rpassword-confirm").closest(".form-group").find(".help-block").hide();
    } else {
      $("#rpassword-confirm").closest(".form-group").find(".help-block").show();
      success = false;
    }
    return success;
  },

  cleanup: function () {
    removeView(this);
  },
});

module.exports = LoginPasswordView;

