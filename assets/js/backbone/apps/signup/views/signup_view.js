
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
    //for the "choose" target/form
    "click #signup-as-applicant" : "gotoApplicantForm",
    "click #signup-as-poster" :    "gotoPosterForm",
  },

  initialize: function() {

    //make a persistent ModalView for the signup form
    this.modal = new ModalView({
      el: this.el,
    }).render();

    this.modal.onNext(this.next);
    this.modal.onSubmit(this.submit);

    //listen for signup requests
    window.cache.userEvents.on("user:request:signup", this.signup);

    this.signup();
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
    this.modal.renderForm({
      html: template(template_data),
      doneButtonText: "Sign Up",
      hideButtons: (target == "choose"),
    });

    //render the core account info fields
    //this will quietly fail if we're on a form that doesn't have it
    this.coreAccount = new CoreAccoutView({
      el: this.$(".core-account-info")
    }).render();

    this.modal.show();

    return this;
  },

  gotoApplicantForm: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.signup("applicant");
  },

  gotoPosterForm: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.signup("poster");
  },

  next: function($page) {
    return true;
  },

  submit: function($form) {
    //target should be either "applicant" or "poster"
    var target = $form.attr("name");

    //in either case, create the new user
    console.log("submit");
  },

  cleanup: function() {
    if(this.coreAccount) this.coreAccount.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = Signup;
