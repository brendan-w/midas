
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');

var ModalView       = require('../../../components/modal_new');

var SignupChoose    = require('../templates/signup_choose.html');
var SignupApplicant = require('../templates/signup_applicant.html');
var SignupPoster    = require('../templates/signup_poster.html');


var Signup = Backbone.View.extend({

  events: {

  },

  initialize: function (options) {

    this.modal = new ModalView({
      el: this.el,
      title: "Sign Up",
    });

    // this.modal.onNext(this.next);
    // this.modal.onSubmit(this.submit);

    this.options = options;
  },

  render: function() {
    var compiledTemplate = _.template(SignupApplicant)({
      //no templating options so far...
    });

    //render the modal wrapper with our form inside
    this.modal.render(compiledTemplate);
    this.modal.show();

    return this;
  },

  next: function() {

  },

  submit: function() {

  },

  cleanup: function() {
    if (this.modal) this.modal.cleanup();
    removeView(this);
  }

});

module.exports = Signup;
