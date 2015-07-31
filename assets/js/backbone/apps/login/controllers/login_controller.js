
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var BaseController = require('../../../base/base_controller');
var LoginView = require('../views/login_view');
var login = require('../../../config/login.json');
var ModalComponent = require('../../../components/modal');


Login = BaseController.extend({

  events: {
    "click #forgot-done-cancel": "showLogin",
    "click #forgot-cancel"     : "showLogin",
    "click #forgot-password"   : "showForgot"
  },

  initialize: function ( options ) {
    this.options = options;
    this.initializeView();
  },

  initializeView: function () {
    var self = this;
    if (this.loginView) {
      this.loginView.cleanup();
      this.modalComponent.cleanup();
    }

    // initialize the modal
    if (!_.isUndefined(this.options.message)) {
      var disableClose = this.options.message.disableClose || false;
    }


  },

  showLogin: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.$("#login-view").show();
    this.$("#login-footer").show();
    this.$("#registration-view").hide();
    this.$("#registration-footer").hide();
    this.$("#forgot-view").hide();
    this.$("#forgot-footer").hide();
    this.$("#forgot-done-view").hide();
    this.$("#forgot-done-footer").hide();
  },

  showForgot: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.$("#forgot-view").show();
    this.$("#forgot-footer").show();
    this.$("#registration-view").hide();
    this.$("#registration-footer").hide();
    this.$("#login-view").hide();
    this.$("#login-footer").hide();
    this.$("#forgot-done-view").hide();
    this.$("#forgot-done-footer").hide();
  },

  // ---------------------
  //= UTILITY METHODS
  // ---------------------
  cleanup: function() {
    if (this.loginView) { this.loginView.cleanup(); }
    if (this.modalComponent) { this.modalComponent.cleanup(); }
    removeView(this);
  }

});

module.exports = Login;
