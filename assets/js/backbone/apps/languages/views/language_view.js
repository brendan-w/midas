
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var ui       = require('../../../config/ui.json');

var TagFactory     = require('../../../components/tag_factory');
var LanguageTemplate = require('../templates/language_template.html');
var LanguageItemTemplate = require('../templates/language_item_template.html');


var Languages = Backbone.View.extend({

  events: {},

  initialize: function() {
    this.tagFactory = new TagFactory();
  },

  render: function(target) {
    var self = this;

    this.$el.html(_.template(LanguageTemplate)({
      //nothing so far...
    }));

    //add a single item
    this.$(".lang-list").append(_.template(LanguageItemTemplate)({
      //nothing so far...
    }));

    this.tagFactory.fetchAllTagsOfType("lang-proficiency", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "lang-proficiency",
        selector:    ".lang-proficiency",
        placeholder: "Select a proficiency",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        width:       "100%",
        fillWith:    tags,
      });
    });

    this.$el.i18n();

    return this;
  },

  cleanup: function() {
    removeView(this);
  }

});

module.exports = Languages;
