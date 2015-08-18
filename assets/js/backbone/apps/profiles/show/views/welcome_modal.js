var _         = require('underscore');
var async     = require('async');
var Backbone  = require('backbone');
var Bootstrap = require('bootstrap');
var utilities = require('../../../../mixins/utilities');
var ModalView = require('../../../../components/modal_new');

var WelcomeTemplate = require('../templates/welcome_template.html');


var WelcomeModal = Backbone.View.extend({

  initialize: function() {
  },

  render: function () {
    if(this.modal) this.modal.cleanup();

    this.modal = new ModalView({
      el: this.el,
    }).render();

    this.listenTo(this.modal, "submit", this.submit);

    //render our form inside the Modal wrapper
    this.modal.renderForm({
      html: _.template(WelcomeTemplate)({}),
      doneButtonText: 'Ok',
      hideCancel: true,
    });


    this.modal.show();

    // Return this for chaining.
    return this;
  },

  submit: function($form) {
    this.modal.hide();
  },

  cleanup: function () {
    if(this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = WelcomeModal;
