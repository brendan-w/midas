var _ = require('underscore');
var Backbone = require('backbone');
var Bootstrap = require('bootstrap');
var utils = require('../../../../mixins/utilities');
var BaseView = require('../../../../base/base_view');

var VetListTemplate = require('../templates/vet_list_template.html');


/*
  pass this view a loaded vet collection
*/
var VetListView = BaseView.extend({

  events: {
    "click .vet-state" : "set_vet_state",
    "click .vet-state" : "set_vet_state",
  },

  initialize: function(options) {
    this.options = options;

  },

  render: function() {
    //render the base template
    this.$el.html(_.template(VetListTemplate)({
      vets: this.collection.toJSON(),
    }));

    this.$el.i18n();
    return this;
  },

  set_vet_state: function(e) {
    if (e && e.preventDefault) e.preventDefault();

    //lookup the ID and requested state from the DOM
    var id = $(e.target).closest("li.vet").data('id');
    var state = $(e.target).data("state");

    //lookup the corresponding Vet model
    var vet = this.collection.findWhere({ id: id });
    vet.set("state", state);
    //save it
    vet.save();
  },

  cleanup: function() {
    removeView(this);
  }
});

module.exports = VetListView;
