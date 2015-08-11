
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var ProfileModel    = require('../../../entities/profiles/profile_model.js');
var ModalView       = require('../../../components/modal_new');
var CoreAccountView = require('./core_account_info_view');
var LanguageView    = require('../../languages/views/language_view.js');
var LinkView        = require('../../links/views/link_view.js');
var TagView         = require('../../tag/show/views/tag_show_view.js');

var RegisterChoose    = require('../templates/register_choose.html');
var RegisterApplicant = require('../templates/register_applicant.html');
var RegisterPoster    = require('../templates/register_poster.html');



var Register = Backbone.View.extend({

  events: {
    //for the "choose" target/form
    "click #register-as-applicant" : "gotoApplicantForm",
    "click #register-as-poster" :    "gotoPosterForm",
  },

  initialize: function() {
    var self = this;

    //make a persistent ModalView for the register form
    this.modal = new ModalView({
      el: this.el,
    }).render();

    //handle modal events
    this.modal.onNext(this.next);
    this.listenTo(this.modal, "submit", this.submit);

    //listen for register events
    this.listenTo(window.cache.userEvents, "user:register:show", this.render);
    this.listenTo(window.cache.userEvents, "user:register:hide", function() {
      self.modal.hide();
    });

    //TODO: remove this when done
    this.render("applicant");
  },

  /*
    the current `target`s are:
      "choose"            <-- default
      "applicant"
      "poster:unapproved"
  */
  render: function(target) {
    if(this.coreAccount) this.coreAccount.cleanup();
    if(this.langView) this.langView.cleanup();
    if(this.linkView) this.linkView.cleanup();

    this.target = target || "choose";

    var template;
    var template_data = {
      //nothing yet...
    };

    //load the requested register form
    switch(this.target)
    {
      case "choose":            template = _.template(RegisterChoose);    break;
      case "applicant":         template = _.template(RegisterApplicant); break;
      case "poster:unapproved": template = _.template(RegisterPoster);    break;
    }

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: template(template_data),
      doneButtonText: "Sign Up",
      hideButtons: (this.target == "choose"),
    });

    //render the core account info fields
    this.coreAccount = new CoreAccountView({
      el: this.$(".core-account-info"),
    }).render();

    //these will quietly fail if we're on a form that doesn't have them
    this.langView = new LanguageView({
      el: this.$(".lang-wrapper"),
      edit: true,
    }).render();

    this.linkView = new LinkView({
      el: this.$(".link-wrapper"),
      edit: true,
    }).render();

    this.tagView = new TagView({
      el: this.$el,
      edit: true,
    }).render();

    this.modal.show();

    return this;
  },

  gotoApplicantForm: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.render("applicant");
  },

  gotoPosterForm: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.render("poster:unapproved");
  },

  next: function($page) {
    //TODO: reset this
    // return !validateAll($page);
    return true;
  },

  submit: function($form) {
    var self = this;

    var user_data = {
      type: this.target,
    };

    //update their profile according to the other form pages
    if(this.target = "applicant")
    {
      user_data.languages = this.langView.data();
      user_data.links     = this.linkView.data();
      user_data.tags      = this.tagView.data();
    }

    //create the user
    //target should be either "applicant" or "poster:unapproved"
    this.coreAccount.submit(user_data, function(user) {

      //when the modal is hidden
      self.$el.bind('hidden.bs.modal', function() {
        // if successful, reload page
        Backbone.history.loadUrl();
        window.cache.userEvents.trigger("user:login:success", user);
        // if (self.options.navigate)
          // window.cache.userEvents.trigger("user:login:success:navigate", user);
      });

      self.modal.hide();
    });
  },

  cleanup: function() {
    if(this.coreAccount) this.coreAccount.cleanup();
    if(this.langView) this.langView.cleanup();
    if(this.linkView) this.linkView.cleanup();
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = Register;
