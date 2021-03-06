/**
 * This component implements a tag widget, allowing creation lookup and deletion of tags from a common ui element
 *
 * Options:
 *
 */

var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var utils = require('../mixins/utilities');
var marked = require('marked');
var BaseComponent = require('../base/base_component');
var jqSelection = require('../../vendor/jquery.selection');


TagFactory = BaseComponent.extend({

	initialize: function (options) {
    this.options = options;

    return this;
  },

  addTagEntities: function (tag, context, done) {
  	//assumes
  	//  tag -- array of tag objects to add
  	//  tagType -- string specifying type for tagEntity table
    var self = this;

  	//this is current solution to mark a tag object as on the fly added
      if ( !tag || typeof tag.unmatched == 'undefined' || !tag.unmatched ){
        return done();
      }
    //remove the flag that marks them as new
    delete tag.unmatched;

    $.ajax({
      url: '/api/tagEntity',
      type: 'POST',
      data: {
        type: tag.tagType,
        name: tag.id,
        data: tag.data
      },
      success: function (data){
        if (context.data) {
          context.data.newTag = data;
          context.data.newItemTags.push(data);
        }
        return done(null, data);
      }
    });
  },

  /*
    required:
    @param {Object}   options
    @param {String}   options.type               - The tag type this dropdown will operate with
    @param {String}   options.selector           - CSS selector or jQuery element of the new dropdown, element should be preexisting

    optional:
    @param {String}   options.width='100%'       - CSS width attribute for the dropdown
    @param {Boolean}  options.multiple=true      - Whether to allow multiple tags to be selected
    @param {Boolean}  options.allowCreate=true   - Whether a `createSearchChoice` option will be given
    @param {String}   options.placeholder="..."  - Placeholder for the dropdown    
    @param {String[]} options.tokenSeparators=[] - Array of valid tag delimeters
    @param {Boolean}  options.searchable=true    - whether the selections are searchable
    @param {*}        options.data=undefined     - The initial data loaded into the select2 element
    @param {Object[]} options.fillWith=undefined - Array of tagEntities that can be selected
                                                   NOTE: when this option is set, AJAX auto-completion is removed

    @returns {jQuery element}                    - The initialized jQuery element selected by options.selector
  */
  createTagDropDown: function(options) {

    //location tags get special treatment
    var isLocation = (options.type === 'location')

    //have to check these beforehand to allow False values to override the default True
    options.multiple    = (options.multiple    !== undefined ? options.multiple    : true);
    options.allowCreate = (options.allowCreate !== undefined ? options.allowCreate : true);
    options.searchable  = (options.searchable  !== undefined ? options.searchable  : true);
    options.data        = options.data || [];

    //default placeholders
    if(!options.placeholder)
    {
      if(options.searchable) options.placeholder = "Start typing to select a " + options.type;
      else                   options.placeholder = "Select a " + options.type;
    }

    //construct the settings for this tag type
    var settings = {

      placeholder:             options.placeholder,
      minimumInputLength:      (isLocation ? 1 : 2),
      selectOnBlur:            false, //!isLocation,
      width:                   options.width || "100%", //"500px",
      tokenSeparators:         options.tokenSeparators || [],
      multiple:                options.multiple,
      minimumResultsForSearch: options.searchable ? 0 : Infinity,


      formatResult: function (obj, container, query) {
        //allow the createSearchChoice to contain HTML
        return (obj.unmatched ? obj.name : _.escape(obj.name));
      },

      formatSelection: function (obj, container, query) {
        return (obj.unmatched ? obj.name : _.escape(obj.name));
      },

      ajax: {
        url: '/api/ac/tag',
        dataType: 'json',
        data: function (term) {
          return {
            type: options.type,
            q: term
          };
        },
        results: function (data) {
          return { results: data };
        }
      },

      initSelection: function(element, callback) {
        var selection = options.data;

        //handle both arrays, and lone objects as initial values
        if(options.multiple)
        {
          if(Object.prototype.toString.call(selection) !== '[object Array]')
            selection = [selection];
        }
        else
        {
          if(Object.prototype.toString.call(selection) === '[object Array]')
            selection = selection[0];
        }

        //add the `text` property for select2
        if(options.multiple)
          selection.forEach(function(t) { t.text = t.name; });
        else if(selection) //in case it's a null selection
          selection.text = selection.name;

        callback(selection);
      },

    };

    if(options.fillWith)
    {
      settings.ajax = undefined;
      settings.minimumInputLength = undefined;
      settings.data = { results: options.fillWith, text:'name' };
    }

    //if requested, give users the option to create new
    if(options.allowCreate) {
      settings.createSearchChoice = function (term, values) {
        values = values.map(function(v) {
          return v.value.toLowerCase();
        });

        if (values.indexOf(term.toLowerCase()) >= 0)
          return false; //don't prompt to "add new" if it already exists

        //unmatched = true is the flag for saving these "new" tags to tagEntity when the opp is saved
        return {
          unmatched: true,
          tagType: options.type,
          id: term,
          value: term,
          temp: true,
          name: "<b>"+_.escape(term)+"</b> <i>" + (isLocation ?
            "search for this location" :
            "click to create a new tag with this value") + "</i>"
        };
      };
    }


    //init Select2
    var $sel = $(options.selector).select2(settings);

    //event handlers
    $sel.on("select2-selecting", function (e) {
      if (e.choice.tagType === 'location') {
        if (e.choice.temp) {
          this.temp = true;
          e.choice.name = '<em>Searching for <strong>' + e.choice.value + '</strong></em>';

          //lookup the new location
          $.get('/api/location/suggest?q=' + e.choice.value, function(d) {
            d = _(d).map(function(item) {
              return {
                id: item.name,
                name: item.name,
                unmatched: true,
                tagType: 'location',
                data: _(item).omit('name')
              };
            });
            this.cache = $sel.select2('data');
            if(settings.multiple) {
              //remove the "Searching for..." text from multi-select boxes
              this.cache = _.reject(this.cache, function(item) {
                return (item.name.indexOf('Searching') >= 0);
              });
            }
            $sel.select2({
              data:               { results: d, text: 'name' },
              width:              settings.width,
              multiple:           settings.multiple,
              formatResult:       settings.formatResult,
              formatSelection:    settings.formatSelection,
              createSearchChoice: settings.createSearchChoice,
            }).select2('data', this.cache).select2('open');
            $sel.remote = false;
          });
        } else {
          this.reload = true;
          delete this.temp;
        }
      } else { //if this is NOT a location tag
        if ( e.choice.hasOwnProperty("unmatched") && e.choice.unmatched ){
          //remove the hint before adding it to the list
          e.choice.name = e.val;
        }
      }
    });

    $sel.on('select2-blur', function(e) {
      if (!this.reload && this.temp) {
        this.reload = true;
        delete this.temp;
      }
    });

    $sel.on('select2-open', function(e) {
      if (!this.reload && this.open) {
        delete this.open;
        delete this.temp;
        var cache = $("#location").select2('data');
        setTimeout(function() {
          $("#location").select2(settings)
            .select2('data', cache)
            .select2('open');
        }, 0);
      } else if (this.reload && this.open) {
        delete this.reload;
      }
    });

    //load initial data, if provided
    //TODO: see if we can clean up this logic
    if(options.data)
    {
      if(Object.prototype.toString.call(options.data) === '[object Array]')
      {
        //if it's an array, make sure it has something in it
        if(options.data.length > 0)
        {
          $sel.select2('val', options.data);
        }
      }
      else
      {
        //else, this is a lone object, for a multiple=false dropdown
        $sel.select2('val', options.data);
      }
    }

    return $sel;
  },

  fetchAllTagsOfType: function(type, cb) {
    $.ajax({
      url: '/api/ac/tag?type=' + type + '&list',
      type: 'GET',
      async: false,
      success: cb,
    });
  },

  getTagsFrom: function($els) {

    var tags = [];

    $els.each(function(i, e) {
      var data = $(e).select2("data");
      if(data) //strains out null values (from where multiple = false)
      {
        //works with lone objects (multiple = false)
        //as well as arrays (multiple = true)
        tags = tags.concat(data);
      }
    });

    tags = _(tags).chain()
                  .filter(function(tag) {
                    return _(tag).isObject() && !tag.context;
                  })
                  .map(function(tag) {
                    if(tag.id && tag.id !== tag.name)
                      //if the tag object has an ID, then reference it by ID
                      return tag.id;
                    else
                      //else, create a new tag object
                      return {
                        name: tag.name,
                        type: tag.tagType,
                        data: tag.data
                      };
                  })
                  .unique()
                  .value();

    return tags;
  },

});

module.exports = TagFactory;
