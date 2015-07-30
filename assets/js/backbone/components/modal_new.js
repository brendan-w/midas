
var _ = require('underscore');
var Backbone = require('backbone');
var utilities = require('../mixins/utilities');
var BaseView = require('../base/base_view');
var ModalTemplate     = require('./modal_wizard_template.html');
var ModalStepTemplate = require('./modal_step_template.html');

/*
  Here's how it works:

  Make your own view, using the modal-wrapper as it's element. Inside
  of your view, instantiate one of these ModalView's, and also set
  it's `el` to your modal-wrapper (so that the two views have control
  over the same element).

  When you call ModalView.render(), hand it your form HTML (post templating).
  The HTML should consist of:


  <form id="name-of-form">
    <section name="name-of-page"> ... </section>
    <section name="name-of-page"> ... </section>
    ...
  </form>


  Each <section> will become a page of your form (requiring the user to
  click "next"). Pages (<section>s) should be given names, which will
  appear as a list of steps in the header. If the form only has one
  page, then the section name will be used as a title.

  The form's ID attribute is not rendered anywhere, but can be used to
  tell which form the modal is currently loaded with. Use ModalView.getFormId()
  to find 

  You can register 3 callbacks with the ModalView:

    onNext(callback)
      The callback will be given a jQuery element for the current page (pre-advance)
      Return True if it is safe to proceed (useful for validation)
    
    onPrev(callback)
      The callback will be given a jQuery element for the current page
      Return True if it is safe to go back (useful for... no clue, but might need it someday)

    onSubmit(callback)
      The callback will be given a jQuery element for the entire <form>
      run your custom submission code here

*/

ModalView = BaseView.extend({

  events: {
    "click .wizard-forward" : "next",
    "click .wizard-backward": "prev",
    "click .wizard-submit"  : "submit",
    "click .wizard-cancel"  : "close",
    "show.bs.modal"         : "wizardButtons"
  },

  /*
    @param {Object} options
    @param {String} options.doneButtonText
  */
  initialize: function(options) {
    this.options = options;

    //default callbacks
    this.on_next_cb   = function() { return true; };
    this.on_prev_cb   = function() { return true; };
    this.on_submit_cb = function() {};
  },


  /*
    creates a modal, and loads the given form HTML
  */
  render: function(compiledTemplate) {

    //render the modal wrapper
    var data = {
      // id: this.options.id,
      // modalTitle: this.options.title,
      doneButtonText: this.options.doneButtonText || "Done",
      draft: this.options.draft
    };

    //load the form wrapper HTML
    this.$el.html(_.template(ModalTemplate)(data));
    //make a few selections, so we don't waste time later
    this.$body       = $(".modal-body");
    this.$steps_list = $(".modal-steps");
    this.$title      = $(".modal-title");
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
      this.$title.hide();

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
      //show a single title instead
      var title = this.$pages.eq(0).attr("name") || "&nbsp;";
      this.$title.show();
      this.$title.html(title);
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
      this.$forward.toggle(!is_last_page);
      this.$backward.toggle(!is_first_page);
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

  hide: function(e) {
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
    this.hide();
    removeView(this);
  },
});

module.exports = ModalView;
