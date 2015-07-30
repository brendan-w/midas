
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var ModalView      = require('../../../components/modal_new');
var CoreAccoutView = require('./core_account_info_view');

var SignupChoose    = require('../templates/signup_choose.html');
var SignupApplicant = require('../templates/signup_applicant.html');
var SignupPoster    = require('../templates/signup_poster.html');


var Signup = Backbone.View.extend({

  events: {

  },

  initialize: function (options) {

    this.modal = new ModalView({
      el: this.el,
      doneButtonText: "Sign Up",
    });

    this.modal.onNext(this.next);
    this.modal.onSubmit(this.submit);

    this.options = options;
  },

  render: function() {
    var compiledTemplate = _.template(SignupPoster)({
      //nothing yet...
    });

    //render the modal wrapper with our form inside
    this.modal.render(compiledTemplate);

    //render the password control
    if(this.coreAccount) this.coreAccount.cleanup();
    this.coreAccount = new CoreAccoutView({
      el: this.$(".core-account-info")
    }).render();

    this.modal.show();

    return this;
  },

  next: function($page) {
    return true;
  },

  submit: function($form) {
    console.log("submit");
  },

  cleanup: function() {
    if(this.coreAccount) this.coreAccount.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = Signup;
