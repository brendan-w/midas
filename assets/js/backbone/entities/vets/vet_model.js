var _ = require('underscore');
var Backbone = require('backbone');

'use strict';

var VetModel = Backbone.Model.extend({

  defaults: {
    user    : null,
    project : null,
    state   : null,
    id      : null,
  },

  urlRoot: '/api/vet',

  initialize: function () {

  },

  remoteGet: function(id) {
    var self = this;
    this.set({ id: id });
    this.fetch({
      success: function (data) {
        self.trigger("vet:model:fetch:success", data);
      },
      error: function(data, xhr) {
        self.trigger("vet:model:fetch:error", data, xhr);
      }
    });
  },

});

module.exports = VetModel;
