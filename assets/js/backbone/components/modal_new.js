// Similar to Modal component in every way in all ways but two:
// 1) This modal has a next button instead of save button.
// 2) This modal has some expectations inside the modal-body form.
//    ^ More on this below
//
// This is all the component expects for it to work:
// <div class='modal-body'>
//  <section class="current">First content section</section>
//  <section>Second content section</section>
//  <section>Third content section</section>
//  <!-- and so on -->
// </div>
//
// REMEMBER: This goes inside your formTemplate.  This
// is the ModalWizardComponent, which is scoped to list controller,
// then the Form itself for the addition to the list is scoped to the
// modal-body within this modal-component template.

var _ = require('underscore');
var Backbone = require('backbone');
var utilities = require('../mixins/utilities');
var BaseView = require('../base/base_view');
var ModalTemplate     = require('./modal_wizard_template.html');
var ModalStepTemplate = require('./modal_step_template.html');


ModalWizard = BaseView.extend({

  events: {
    "click .wizard-forward" : "moveWizardForward",
    "click .wizard-backward": "moveWizardBackward",
    "click .wizard-submit"  : "submit",
    "click .wizard-cancel"  : "close",
    "show.bs.modal"         : "wizardButtons"
  },

  /*
    @param {Object} options
    @param {String} options.title

  */
  initialize: function(options) {
    this.options = options;
    // this.initializeListeners();
  },

  initializeListeners: function() {
    var self = this;
    if (this.model) {
      this.listenTo(this.model, this.options.modelName + ':modal:hide', function() {
        self.close();
      });
    }
  },

  render: function(compiledTemplate) {

    //render the modal wrapper
    var data = {
      id: this.options.id,
      modalTitle: this.options.title,
      draft: this.options.draft
    };

    //load the form wrapper HTML
    this.$el.html(_.template(ModalTemplate)(data));
    //make a few selections, so we don't waste time later
    this.$body       = $(".modal-body");
    this.$steps_list = $(".modal-steps");

    //load the child view's HTML
    this.$body.html(compiledTemplate);
    //find the form, and each of the pages
    this.$form  = this.$body.find(">form");
    this.$pages = this.$form.children();

    //if there are multiple pages, load them as steps in the header
    if(this.$pages.length > 2)
    {
      this.$steps_list.show();

      //append a numbered step for each page in the form
      for(var i = 0; i < this.$pages.length; i++)
      {
        this.$steps_list.append(_.template(ModalStepTemplate)({
          i: i+1, // +1 for human readable numbers
          name: this.$pages.eq(i).attr("name"),
        }));
      }
    }
    else
    {
      //single page, don't bother with the step markers
      this.$steps_list.hide();
    }

    this.gotoPage(0); //load the initial page
  },

  gotoPage: function(i) {
    if((i >= 0) && (i < this.$pages.length))
    {
      //select it, and save it
      this.$current = this.$pages.eq(i);

      //show ONLY the desired page
      this.$pages.hide();
      this.$current.show();

      //highlight the currect step
      this.$steps_list.find(".active").removeClass("active");
      this.$steps_list.children().eq(i).addClass("active");
    }
    else
    {
      console.log("invalid page number for modal");
    }
  },

  //returns the ID of the currently rendered form
  getFormId: function() {
    return this.$form.attr("id");
  },

  show: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    $(".modal").modal('show');
  },

  close: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    $(".modal").modal('hide');
  },

  










  /**
   * Set the child of this view, so we can remove it
   * when the view is destroyed
   * @return this for chaining
   */
  setChildView: function(view) {
    this.childView = view;
    return this;
  },

  /**
   * Set the callback on the next button of the modal.
   * Useful for callbacks
   * @return this for chaining
   */
  setNext: function(fn) {
    this.childNext = fn;
    return this;
  },

  /**
   * Set the callback on the submit button of the modal.
   * Useful for callbacks
   * @return this for chaining
   */
  setSubmit: function(fn) {
    this.childSubmit = fn;
    return this;
  },

  // Set up wizard buttons based on whether or not position in flow.
  // Assumes current step if one not given.
  //
  // If you want to force disable one or more buttons on a step of the wizard,
  // add a data-disable-buttons attribute with a space-separated lst.
  wizardButtons: function(e, step) {
    if (_.isUndefined(step)) {
      step = $('.current');
    }
    var prevAvailable = step.prev() && !_.isUndefined(step.prev().html());
    var nextAvailable = step.next() && !_.isUndefined(step.next().html());
    if (nextAvailable) {
      $("#wizard-forward-button").show();
      $("#wizard-create-button").hide();
    } else {
      $("#wizard-forward-button").hide();
      $("#wizard-create-button").show();
    }
    this.$(".btn").prop('disabled', false);
    $("#wizard-backward-button").prop('disabled', !prevAvailable);
    var disables = step.data('disable-buttons');
    if (disables) {
      disables.split(" ").forEach(function(disable) {
        $("#wizard-" + disable + "-button").prop('disabled', true);
      });
    }
  },

  // In order for the ModalWizard to work it expects a section
  // by section layout inside the modal, with a 'current' class on
  // the first you want to always start on (re)render.
  moveWizardForward: function(e) {
    if (e.preventDefault) e.preventDefault();

    // Store $(".current") in cache to reduce query times for DOM lookup
    // on future children and adjacent element to the current el.
    var current = $(".current");
    var next = current.next();

    // Notify the sub-view to see if it is safe to proceed
    // if not, return and stop processing.
    if (this.childNext) {
      var abort = this.childNext(e, current);
      if (abort) return;
    }
    this.wizardButtons(null, next);
    current.hide();
    current.removeClass("current");
    next.addClass("current");
    next.show();
  },

  moveWizardBackward: function(e) {
    if (e.preventDefault) e.preventDefault();

    var current = $(".current");
    var prev = current.prev();

    if (!_.isUndefined(prev.html())) {
      this.wizardButtons(null, prev);
      current.hide();
      current.removeClass("current");
      prev.addClass("current");
      prev.show();
    }
  },

  // Dumb submit.  Everything is expected via a promise from
  // from the instantiation of this modal wizard.
  submit: function(e) {
    if (e.preventDefault) e.preventDefault();

  },

  cleanup: function() {
    this.hide();
    removeView(this);
  }
});

module.exports = ModalWizard;
