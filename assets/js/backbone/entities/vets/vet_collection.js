var _ = require('underscore');
var Backbone = require('backbone');
var VetModel = require('./vet_model');

'use strict';

var VetCollection = Backbone.Collection.extend({

  model: VetModel,
  url: '/api/vet/findAllPending',


  initialize: function () {
  },

});

module.exports = VetCollection;
