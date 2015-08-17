
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var   ApplicationTemplate = require('../templates/application_template.html');
var FinishProfileTemplate = require('../templates/finish_profile_template.html');


var ApplicationModal = Backbone.View.extend({

  events: {
    'click .link-backbone' : linkBackbone,
  },


  /*
    @param {Integer} options.id  -  The ID of the task that is being applied for
  */
  initialize: function (options) {
    this.options = options;

    //make a persistent ModalView for the register form
    this.modal = new ModalView({
      el: this.el,
    }).render();

    //handle modal events
    this.listenTo(this.modal, "submit", this.submit);

  },

  render: function() {
    var self = this;

    $.ajax({
      url: "/api/user/canApply",
      type: 'GET',
      success: function(data) {
        if(data)
          self.renderTarget("apply");
        else
          self.renderTarget("finish_profile");
      },
    });

    return this;

  },

  renderTarget: function(target) {
    this.target = target;

    var template_data = {};
    var form = {};

    //load the requested register form
    switch(this.target)
    {
      case "apply":
        form.html = _.template(ApplicationTemplate)(template_data);
        form.doneButtonText = "Apply";
        break;
      case "finish_profile":
        form.html = _.template(FinishProfileTemplate)(template_data);
        form.doneButtonText = "Go To Your Profile";
        break;
    }

    //render our form inside the Modal wrapper
    this.modal.renderForm(form);
    this.modal.show();
  },

  submit: function() {
    switch(this.target)
    {
      case "apply":          this.submitApplication(); break;
      case "finish_profile": this.gotoProfile();       break;
    }
  },

  submitApplication: function() {
    console.log("submit");
  },

  gotoProfile: function() {

    this.$el.bind('hidden.bs.modal', function () {
      Backbone.history.navigate("/profile/" + window.cache.currentUser.id + "/edit", { trigger: true });
    });

    this.modal.hide();
  },

  cleanup: function () {
    if(this.modal) this.modal.cleanup();
    removeView(this);
  },
});

module.exports = ApplicationModal;
