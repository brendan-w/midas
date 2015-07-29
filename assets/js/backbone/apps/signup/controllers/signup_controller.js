
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var BaseController = require('../../../base/base_controller');
var SignupView     = require('../views/signup_view');


var SignupController = BaseController.extend({


  initialize: function (options) {
    this.options = options;

    //listen for signup requests
    window.cache.userEvents.on("user:request:signup", this.signup);

    this.signup("");
  },

  signup: function(message) {

    //close any existing modal
    if (this.signupView) this.signupView.cleanup();

    //make the modal
    this.signupView = new SignupView({

      el: this.el,

    }).render();


  },

  cleanup: function() {
    if (this.signupView) this.signupView.cleanup();
    removeView(this);
  }


});

module.exports = SignupController;
