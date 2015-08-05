
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

  //optionally accepts an array of initial data
  //from the `languages` property of the profile model.
  render: function(initial_langs) {
    var self = this;
    initial_langs = initial_langs || [];

    this.$el.html(_.template(LanguageTemplate)({
      //nothing so far...
    }));

    //if initial_langs are given, use them to fill the UI
    this.tagFactory.fetchAllTagsOfType("lang-proficiency", function(tags) {

      self.proficiencies = tags;

      initial_langs.forEach(function(lang) {
        self.$(".lang-list").append(_.template(LanguageItemTemplate)({
          id: lang.id,
        }));

        var $lang    = self.$(".lang-list").children().last();
        var $written = $lang.find(".lang-written .lang-proficiency");
        var $spoken  = $lang.find(".lang-spoken  .lang-proficiency");

        //fill in the language's name
        $lang.find(".lang-name").val(lang.language);

        //make the dropdowns
        self.tagFactory.createTagDropDown({
          type:        "lang-proficiency",
          selector:    $written,
          multiple:    false,
          allowCreate: false,
          searchable:  false,
          width:       "100%",
          fillWith:    self.proficiencies,
          data:        _.findWhere(self.proficiencies, { id : lang.writtenProficiency }),
        });

        self.tagFactory.createTagDropDown({
          type:        "lang-proficiency",
          selector:    $spoken,
          multiple:    false,
          allowCreate: false,
          searchable:  false,
          width:       "100%",
          fillWith:    self.proficiencies,
          data:        _.findWhere(self.proficiencies, { id : lang.spokenProficiency }),
        });

      }); //initial_langs.forEach()

    }); //fetchAllTagsOfType()

    this.$el.i18n();

    return this;
  },

  //returns an array of data to be submitted in
  //the `languages` field of the profile model.
  data: function() {

    if(validateAll(this.$el))
      return false;

    var langs = [];

    this.$(".lang").each(function(i, lang) {
      var $lang = $(lang);
      var id    = $lang.data('id');

      //fetch the language name and the proficiencies
      var language = $lang.find(".lang-name").val();
      var written  = $lang.find(".lang-written .lang-proficiency").select2('data').id;
      var spoken   = $lang.find(".lang-spoken  .lang-proficiency").select2('data').id;

      if(id)
      {
        //if it has an ID, then it's pre-existing, and Sails will recognize it by ID
        langs.push(id);
      }
      else
      {
        //else, we have to create a new one
        langs.push({
          language:           language,
          writtenProficiency: written,
          spokenProficiency:  spoken,
        });
      }
    });

    return langs;
  },

  add_lang: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    var self = this;

    //add a new language item
    this.$(".lang-list").append(_.template(LanguageItemTemplate)({
      id: "", //not a pre-existing language
    }));

    //select it
    var $items = this.$(".lang-list").children().last().find(".lang-proficiency");

    //instantiate the dropdowns
    self.tagFactory.createTagDropDown({
      type:        "lang-proficiency",
      selector:    $items,
      multiple:    false,
      allowCreate: false,
      searchable:  false,
      width:       "100%",
      fillWith:    this.proficiencies,
      data:        this.proficiencies[0],
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
