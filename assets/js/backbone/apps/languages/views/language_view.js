
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var ui       = require('../../../config/ui.json');

var TagFactory     = require('../../../components/tag_factory');
var LanguageTemplate = require('../templates/language_template.html');
var LanguageItemTemplate = require('../templates/language_item_template.html');


var Languages = Backbone.View.extend({

  events: {
    "click .lang .close" : "delete_lang", 
    "click .lang-add"    : "add_lang",
  },

  initialize: function() {
    this.tagFactory = new TagFactory();
  },

  render: function(target) {
    var self = this;

    this.$el.html(_.template(LanguageTemplate)({
      //nothing so far...
    }));

    this.$el.i18n();

    return this;
  },

  add_lang: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    var self = this;

    this.$(".lang-list").append(_.template(LanguageItemTemplate)({
      //nothing so far...
    }));

    var $items = this.$(".lang-list").children().last(0).find(".lang-proficiency");

    this.tagFactory.fetchAllTagsOfType("lang-proficiency", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "lang-proficiency",
        $el:         $items,
        placeholder: "Select a proficiency",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        width:       "100%",
        fillWith:    tags,
      });
    });

  },

  delete_lang: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    $(e.target).closest(".lang").remove();
  },

  cleanup: function() {
    removeView(this);
  }

});

module.exports = Languages;
