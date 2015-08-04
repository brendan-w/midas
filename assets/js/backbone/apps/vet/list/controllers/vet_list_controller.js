
var _ = require('underscore');
var Backbone = require('backbone');
var BaseController = require('../../../../base/base_controller');

var VetCollection = require('../../../../entities/vets/vet_collection');
var VetListView = require('../views/vet_list_view.js');

var VetList = BaseController.extend({

  initialize: function (options) {
    this.options = options;

    this.collection = new VetCollection();

    this.listenTo(this.collection, "sync", this.initializeView);
    this.collection.fetch();
  },

  initializeView:function() {
    if (this.vetListView) this.vetListView.cleanup();
    this.vetListView = new VetListView({
      el: this.el,
      collection: this.collection,
    }).render();
  },

  cleanup: function() {
    if (this.vetListView) this.vetListView.cleanup();
    removeView(this);
  }

});

module.exports = VetList;
