var _ = require('underscore');
var Backbone = require('backbone');
var Bootstrap = require('bootstrap');
var utils = require('../../../../mixins/utilities');
var BaseView = require('../../../../base/base_view');

var VetListTemplate = require('../templates/vet_list_template.html');
var VetListItemTemplate = require('../templates/vet_list_item_template.html');


/*
  pass this view a loaded vet collection
*/
var VetListView = BaseView.extend({

  initialize: function(options) {
    this.options = options;

  },

  render: function() {
    var self = this;

    //render the base template
    self.$el.html(_.template(VetListTemplate)({
      //nothing yet...
    }));

    this.$list = this.$("#vet-list-pending");

    this.collection.each(function(vet) {
      self.$list.append(_.template(VetListItemTemplate)({
        vet: vet.toJSON(),
      }));
    });

    self.$el.i18n();
    return this;
  },

  cleanup: function() {
    removeView(this);
  }
});

module.exports = VetListView;
