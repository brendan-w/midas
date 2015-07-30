
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var PasswordControlTemplate = require('../templates/password_control.html');


var LoginPasswordView = Backbone.View.extend({

  events: {
    'keyup #rpassword'         : 'checkPassword',
    'blur #rpassword'          : 'checkPassword',
    'keyup #rpassword-confirm' : 'checkPasswordConfirm',
    'blur #rpassword-confirm'  : 'checkPasswordConfirm',
  },

  initialize: function(options) {
    this.options = options;
  },

  render: function() {
    this.$el.html(_.template(PasswordControlTemplate));
    this.username = "";
    return this;
  },

  //the password field will check that it does not contain the username
  //use this function to set the username that the password box checks against
  checkAgainstUsername: function(username) {
    this.username = username;
  },

  checkPassword: function(e) {
    var rules = validatePassword(this.username, this.$("#rpassword").val());
    var valuesArray = _.values(rules);
    var validRules = _.every(valuesArray);
    var success = true;
    if (validRules === true) {
      $("#rpassword").closest(".form-group").removeClass('has-error');
      $("#rpassword").closest(".form-group").find(".help-block").hide();
    }
    _.each(rules, function(value, key) {
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

  checkPasswordConfirm: function(e) {
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

  cleanup: function() {
    removeView(this);
  },
});

module.exports = LoginPasswordView;
