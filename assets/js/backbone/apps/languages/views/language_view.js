
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
    "click .lang-test"   : "load_into_user",
  },

  initialize: function() {
    this.tagFactory = new TagFactory();
  },

  render: function(user) {
    var self = this;

    this.$el.html(_.template(LanguageTemplate)({
      //nothing so far...
    }));

    //if a user model is provided, use it to fill the UI
    if(user)
    {
      this.$(".lang-list").append(_.template(LanguageItemTemplate)({
        id: "",
      }));

    }

    this.$el.i18n();

    return this;
  },

  load_into_user: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.$(".lang").each(function(i, lang) {
      var $lang = $(lang);

      //fetch the proficiencies
      var written = $lang.find(".lang-written .lang-proficiency").select2('data');
      var spoken  = $lang.find(".lang-spoken  .lang-proficiency").select2('data');


    });
  },

  add_lang: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    var self = this;

    //add a new language item
    this.$(".lang-list").append(_.template(LanguageItemTemplate)({
      id: "",
    }));

    //select it
    var $items = this.$(".lang-list").children().last().find(".lang-proficiency");

    //instantiate the dropdowns
    this.tagFactory.fetchAllTagsOfType("lang-proficiency", function(tags) {
      self.tagFactory.createTagDropDown({
        type:        "lang-proficiency",
        selector:    $items,
        placeholder: "Select a proficiency",
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        width:       "100%",
        fillWith:    tags,
        data:        tags[0],
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
