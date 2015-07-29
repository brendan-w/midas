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
    "click .wizard-forward" : "next",
    "click .wizard-backward": "prev",
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

    //default callbacks
    this.on_next_cb   = function() { return true; };
    this.on_prev_cb   = function() { return true; };
    this.on_submit_cb = function() { return true; };
  },


  /*
    sets of the modal for the given form HTML

    the HTML should consist of:

    <form id="name-of-form">
      <section name="name-of-page"></section>
      <section name="name-of-page"></section>
      ...
    </form>
  */
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
    this.$forward    = $("#wizard-forward-button");
    this.$backward   = $("#wizard-backward-button");
    this.$submit     = $("#wizard-create-button");
    //the draft button isn't wired yet

    //load the child view's HTML
    this.$body.html(compiledTemplate);
    //find the form, and each of the pages
    this.$form     = this.$body.find(">form");
    this.$pages    = this.$form.children();
    this.num_pages = this.$pages.length;

    //if there are multiple pages, load them as steps in the header
    if(this.num_pages > 2)
    {
      this.$steps_list.show();

      //append a numbered step for each page in the form
      for(var i = 0; i < this.num_pages; i++)
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
    if((i >= 0) && (i < this.num_pages))
    {
      this.current_page = i;

      //select it, and save it
      this.$current = this.$pages.eq(i);

      //show ONLY the desired page
      this.$pages.hide();
      this.$current.show();

      //highlight the currect step
      this.$steps_list.find(".active").removeClass("active");
      this.$steps_list.children().eq(i).addClass("active");

      //update the button states
      this.updateButtons();
    }
    // else, not a valid page number, do nothing
  },

  updateButtons: function() {
    //if multiple pages
    if(this.num_pages > 2)
    {
      var is_first_page = (this.current_page === 0);
      var is_last_page = (this.current_page === this.num_pages - 1);

      this.$forward.show();
      this.$backward.show();
      this.$submit.toggle(is_last_page);

      //disable/enable the correct next/prev buttons
      this.$forward.prop( 'disabled', is_last_page);
      this.$backward.prop('disabled', is_first_page);
    }
    else
    {
      //single page form
      //hide the next/back buttons
      this.$forward.hide();
      this.$backward.hide();
      this.$submit.show();
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

  next: function(e) {
    if(e && e.preventDefault) e.preventDefault();

    //check if we're allowed to continue
    if(this.on_next_cb(this.$page))
      this.gotoPage(this.current_page + 1);
  },

  prev: function(e) {
    if(e && e.preventDefault) e.preventDefault();

    //check if we're allowed to go backwards
    if(this.on_next_cb(this.$page))
      this.gotoPage(this.current_page - 1);        
  },

  submit: function(e) {
    if (e.preventDefault) e.preventDefault();

    //call child view's submission
    this.on_submit_cb(this.$form)
  },

  onNext: function(cb) {
    this.on_next_cb = cb;
  },

  onPrev: function(cb) {
    this.on_prev_cb = cb;
  },

  onSubmit: function(cb) {
    this.on_submit_cb = cb;
  },

  cleanup: function() {
    this.close();
    removeView(this);
  },
});

module.exports = ModalWizard;
