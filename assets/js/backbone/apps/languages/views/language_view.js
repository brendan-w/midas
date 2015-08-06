
var _        = require('underscore');
var Backbone = require('backbone');
var utils    = require('../../../mixins/utilities');
var ui       = require('../../../config/ui.json');

var TagFactory     = require('../../../components/tag_factory');
var LanguageTemplate = require('../templates/language_template.html');
var LanguageItemTemplate = require('../templates/language_item_template.html');


var Languages = Backbone.View.extend({

  events: {
    "click .lang-add"    : "add_lang_button",
    "click .lang .close" : "delete_lang_button", 
  },

  /*
    @param {Boolean} options.edit   -   whether to place the language form in edit mode
  */
  initialize: function(options) {
    this.options = options;
    this.edit    = options.edit || false;
    this.tagFactory = new TagFactory();
  },

  //optionally accepts an array of initial data
  //from the `languages` property of the profile model.
  render: function(initial_langs) {
    var self = this;
    initial_langs = initial_langs || [];

    this.$el.html(_.template(LanguageTemplate)({
      edit: this.edit, //are we in edit mode?
    }));

    //if initial_langs are given, use them to fill the UI
    this.tagFactory.fetchAllTagsOfType("lang-proficiency", function(tags) {
      self.proficiencies = tags;

      initial_langs.forEach(function(lang) {
        //needs to be wrapped to preserve context
        self.add_lang(lang); //populate the UI with the initial data
      });

      self.update_empty();

      self.$el.i18n();
    });

    return this;
  },

  //returns an array of data to be submitted in
  //the `languages` field of the profile model.
  data: function() {

    if(validateAll(this.$el))
      return false;

    var langs = [];

    this.$(".lang").each(function(i, l) {
      var $lang = $(l);
      var id    = $lang.data('id');

      //fetch the language name and the proficiencies
      var language = $lang.find(".lang-name").val();
      var written  = $lang.find(".lang-written .lang-proficiency").select2('data').id;
      var spoken   = $lang.find(".lang-spoken  .lang-proficiency").select2('data').id;

      var lang = {
        language:           language,
        writtenProficiency: written,
        spokenProficiency:  spoken,
      };

      //if it has an ID, then it's pre-existing, and Sails will update it by ID
      if(id) lang.id = id;

      langs.push(lang);
    });

    return langs;
  },

  add_lang_button: function(e) {
    if(e && e.preventDefault) e.preventDefault();

    this.add_lang({
      id: "",
      language: "",
      writtenProficiency: this.proficiencies[0].id,
      spokenProficiency:  this.proficiencies[0].id,
    });
  },

  //accepts initial JSON lang model 
  add_lang: function(raw_lang) {

    //a little bit of pre-proccessing on the language model data
    //rebuild the object, so as to not polute the original
    var lang = {
      id                 : raw_lang.id || "",
      language           : raw_lang.language || "",
      //dereference Tag IDs into actual tag models
      writtenProficiency : _.findWhere(this.proficiencies, { id : raw_lang.writtenProficiency }),
      spokenProficiency  : _.findWhere(this.proficiencies, { id : raw_lang.spokenProficiency }),
    };

    //add a new language item
    this.$(".lang-list").append(_.template(LanguageItemTemplate)({
      edit: this.edit, //are we in edit mode?
      lang: lang,
    }));

    //if we're in edit mode, then there's extra work to setup each language item
    if(this.edit)
    {
      //select it
      var $lang    = this.$(".lang-list").children().last();
      var $written = $lang.find(".lang-written .lang-proficiency");
      var $spoken  = $lang.find(".lang-spoken  .lang-proficiency");

      var $items = this.$(".lang-list").children().last().find(".lang-proficiency");

      //fill in the language's name
      $lang.find(".lang-name").val(lang.language);

      //instantiate the dropdowns
      this.tagFactory.createTagDropDown({
        type:        "lang-proficiency",
        selector:    $written,
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        width:       "100%",
        fillWith:    this.proficiencies,
        data:        lang.writtenProficiency,
      });

      this.tagFactory.createTagDropDown({
        type:        "lang-proficiency",
        selector:    $spoken,
        multiple:    false,
        allowCreate: false,
        searchable:  false,
        width:       "100%",
        fillWith:    this.proficiencies,
        data:        lang.spokenProficiency,
      }); 
    }

    this.update_empty();
  },

  delete_lang_button: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    $(e.target).closest(".lang").remove();

    this.update_empty();
  },

  update_empty: function() {
    //show or hide the "Empty" text
    var is_empty = (this.$(".lang-list").children().length == 0);
    this.$(".lang-list-empty").toggle(is_empty);
  },

  cleanup: function() {
    removeView(this);
  }

});

module.exports = Languages;
