
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

  initialize: function () {

    //make a persistent ModalView for the signup form
    this.modal = new ModalView({
      el: this.el,
      doneButtonText: "Sign Up",
    });

    this.modal.onNext(this.next);
    this.modal.onSubmit(this.submit);

    //listen for signup requests
    window.cache.userEvents.on("user:request:signup", this.signup);

    this.signup("poster");
  },

  /*
    the current `target`s are:
      "applicant"
      "poster"
      "choose"    <-- default
  */
  signup: function(target) {
    if(this.coreAccount) this.coreAccount.cleanup();

    target = target || "choose";

    var template;
    var template_data = {
      //nothing yet...
    };

    //load the requested signup form
    switch(target)
    {
      case "choose":    template = _.template(SignupChoose);    break;
      case "applicant": template = _.template(SignupApplicant); break;
      case "poster":    template = _.template(SignupPoster);    break;
    }

    //render our form inside the Modal wrapper
    this.modal.render(template(template_data));

    //render the core account info fields
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
