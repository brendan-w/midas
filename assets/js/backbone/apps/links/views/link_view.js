
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var ui       = require('../../../config/ui.json');

var LinkListTemplate     = require('../templates/link_list_template.html');
var LinkListItemTemplate = require('../templates/link_list_item_template.html');


var LinkView = Backbone.View.extend({

  events: {
    "click .link-add"    : "add_link_button",
    "click .link .close" : "delete_link", 
  },

  /*
    @param {Boolean} options.edit   -   whether to place the link form into edit mode
  */
  initialize: function(options) {
    this.options = options;
    this.edit    = options.edit;
  },

  //optionally accepts an array of initial data
  //from the `links` property of the profile model.
  render: function(initial_links) {
    var self = this;
    initial_links = initial_links || [];

    this.$el.html(_.template(LinkListTemplate)({
      edit: this.edit, //are we in edit mode?
    }));

    //add the initial links
    initial_links.forEach(function(link) {
      //needs to be wrapped to preserve context
      self.add_link(link);
    });

    this.$el.i18n();

    return this;
  },

  add_link_button: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.add_link({
      url: "",
    });
  },

  add_link: function(link) {
    this.$(".link-list").append(_.template(LinkListItemTemplate)({
      edit: this.edit, //are we in edit mode?
      link: link,
    }));
  },

  delete_link: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    $(e.target).closest(".link").remove();
  },

  cleanup: function() {
    removeView(this);
  }

});

module.exports = LinkView;
