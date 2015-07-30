
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var ModalView       = require('../../../components/modal_new');
var CoreAccountView = require('./core_account_info_view');

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
    var self = this;

    //make a persistent ModalView for the signup form
    this.modal = new ModalView({
      el: this.el,
    }).render();

    //handle modal events
    this.modal.onNext(this.next);
    this.listenTo(this.modal, "submit", this.submit);

    //listen for signup events
    this.listenTo(window.cache.userEvents, "user:register:show", this.signup);
    this.listenTo(window.cache.userEvents, "user:register:hide", function() {
      self.modal.hide();
    });
  },

  /*
    the current `target`s are:
      "choose"            <-- default
      "applicant"
      "poster:unapproved"
  */
  signup: function(target) {
    console.log("asdddf");
    if(this.coreAccount) this.coreAccount.cleanup();

    this.target = target || "choose";

    var template;
    var template_data = {
      //nothing yet...
    };

    //load the requested signup form
    switch(this.target)
    {
      case "choose":            template = _.template(SignupChoose);    break;
      case "applicant":         template = _.template(SignupApplicant); break;
      case "poster:unapproved": template = _.template(SignupPoster);    break;
    }

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: template(template_data),
      doneButtonText: "Sign Up",
      hideButtons: (this.target == "choose"),
    });

    //render the core account info fields
    //this will quietly fail if we're on a form that doesn't have it
    this.coreAccount = new CoreAccountView({
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
    this.signup("poster:unapproved");
  },

  next: function($page) {
    // find all the validation elements
    var abort = false;
    _.each($page.find('.validate'), function (child) {
      abort = abort || validate({ currentTarget: child });
    });
    return !abort;
  },

  submit: function($form) {
    var self = this;

    //create the user
    //target should be either "applicant" or "poster:unapproved"
    this.coreAccount.submit(this.target, function() {
      //update their profile according to the other form pages
      console.log("submit");

      self.modal.hide();
    });
  },

  cleanup: function() {
    if(this.coreAccount) this.coreAccount.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = Signup;
