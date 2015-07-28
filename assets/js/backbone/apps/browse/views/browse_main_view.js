var select2 = require('Select2');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var UIConfig = require('../../../config/ui.json');
var Popovers = require('../../../mixins/popovers');
var TagConfig = require('../../../config/tag');
var BrowseListView = require('./browse_list_view');
var ProfileListView = require('./profile_list_view');
var ProfileMapView = require('./profile_map_view');
var BrowseMainTemplate = require('../templates/browse_main_view_template.html');
var BrowseSearchTag = require('../templates/browse_search_tag.html');
var BrowseProjectTemplate = require('../templates/browse_project_view_template.html');
var BrowseTaskTemplate = require('../templates/browse_task_view_template.html');


var popovers = new Popovers();

var BrowseMainView = Backbone.View.extend({

  events: {
    "submit #search-form"             : "searchBar",
    "click .search-tag-remove"        : "searchTagRemove",
    "click .search-clear"             : "searchClear",
    "change .stateFilter"             : "searchTagRemove",
    "mouseenter .project-people-div"  : popovers.popoverPeopleOn,
    "click      .project-people-div"  : popovers.popoverClick,
    "keyup .select2-container"        : "submitOnEnter"
  },

  initialize: function (options) {
    this.options = options;
  },

  render: function () {
    var options = {
      target: this.options.target,
      user: window.cache.currentUser,
      ui: UIConfig
    };

    if(options.target == 'projects')
      this.compiledTemplate = _.template(BrowseProjectTemplate)(options);
    else if(options.target == 'tasks')
      this.compiledTemplate = _.template(BrowseTaskTemplate)(options);

    this.$el.html(this.compiledTemplate);
    this.$el.i18n();

    this.initializeSearch();

    // Allow chaining.
    return this;
  },

  format: function (self, object, container, query) {
    var formatIcon = "";
    var name = object.name || object.title;
    var icon = this.tagIcon[object.type];
    if (object.target == 'project') {
      icon = 'fa fa-folder-o';
    } else if (object.target == 'task') {
      icon = 'fa fa-tag';
    }

    if (!object.unmatched) {
      //unmatched name is escaped in createSearchChoice func to preserve html formatting
      name = _.escape(name);
      formatIcon = '<i class="' + _.escape(icon) + '"></i>';
    }

    return  formatIcon+'<span class="box-icon-text">' + name + '</span>';
  },

  initializeSearch: function() {
    var self = this;
    this.searchTerms = [];
    this.tags = [];

    // figure out which tags apply
    for (var i = 0; i < TagConfig[this.options.target].length; i++) {
      this.tags.push(TagConfig.tags[TagConfig[this.options.target][i]]);
    }

    // extract tag icons and classes
    this.tagIcon = {};
    this.tagClass = {};
    for (var i = 0; i < this.tags.length; i++) {
      this.tagIcon[this.tags[i].type] = this.tags[i].icon;
      this.tagClass[this.tags[i].type] = this.tags[i]['class'];
    }

    var formatResult = function (object, container, query) {
      return self.format(self, object, container, query);
    };

    var searchPlaceholder = function () {
      if (self.options.target == 'projects') {
        return "I'm looking for working groups by name, agency, skill, topic, description...";
      } else if (self.options.target == 'tasks') {
        return "I'm looking for opportunities by name, agency, skill, topic, description...";
      } else if (self.options.target == 'profiles') {
        return "I'm looking for people by name, title, agency, location...";
      } else {
        return "I'm looking for...";
      }
    };

    // Initialize Select2
    $("#search").select2({
      placeholder: searchPlaceholder,
      multiple: true,
      formatResult: formatResult,
      formatSelection: function(object,container,query) {
          //null object.target to remove the task / project icons that get readded when terms go
          //     to the search box on the right
          object.target = null;
          object.type   = object.name || object.title;
          object.id     = object.name || object.title;
          object.value  = object.name || object.title;
          object.unmatched = true;
          return object.name || object.title;
      },
      createSearchChoice: function (term) {
          return { unmatched: true,id: term, value: term, name: "<b>"+_.escape(term)+"</b> <i>click to text search for this value.</i>" };
      },
      ajax: {
        url: '/api/ac/search/' + self.options.target,
        dataType: 'json',
        data: function (term) {
          return {
            type: TagConfig[self.options.target].join(),
            q: term
          };
        },
        results: function (data) {
          return { results: data };
        }
      }
    }).on("select2-selecting", function (e){
        if ( e.choice.hasOwnProperty("unmatched") && e.choice.unmatched ){
          //remove the hint before adding it to the list
          e.choice.name = e.val;
        }
      });
  },

  submitOnEnter: function (e) {
    if(e.keyCode === 13) {
      this.searchBar(e);
    }
  },

  addSearchTerm: function (term) {
    // add it to our list of search terms
    this.searchTerms.push(term);
    // render the search term in the list
    var templData = {
      data: term,
      format: this.format(this, term)
    };
    var templ = _.template(BrowseSearchTag)(templData);
    if (term.target == 'tagentity') {
      $("#search-tags").append(templ);
    } else {
      $("#search-projs").append(templ);
    }
  },

  existingSearchTerm: function (term) {
    var found = false;
    // check if this search term already is chosen
    for (var i in this.searchTerms) {
      if (this.searchTerms[i].id == term.id) {
        if (this.searchTerms[i].title && (this.searchTerms[i].title == term.title)) {
          found = true;
        }
        else if (this.searchTerms[i].name && (this.searchTerms[i].name == term.name)) {
          found = true;
        }
      }
    }
    return found;
  },

  searchBar: function (e) {
    var self=this;
    if (e.preventDefault) e.preventDefault();
    // get values from select2
    var searchTerms = $("#search").select2("data");
    if (searchTerms.length > 0) {
      $("#search-none").hide();
      $(".search-clear").show();
    }
    _.each(searchTerms, function (d) {
      if (self.existingSearchTerm(d)) {
        return;
      }
      self.addSearchTerm(d);
    });
    $("#search").select2("data", "");
    this.searchExec(this.searchTerms);
  },

  searchMap: function (loc) {
    // this is a hack to make a location search mimic a menu bar search. If this worked
    // properly, field = type = "location" but search doesn't work like that now (broken).
    var locItem = {
      field: "location",
      id: loc,
      name: loc,
      type: "location",
      value: loc,
      unmatched: true
    }
    if (this.existingSearchTerm(locItem)) {
      return;
    }
    this.addSearchTerm(locItem);
    if (this.searchTerms.length > 0) {
      $("#search-none").hide();
      $(".search-clear").show();
    }
    this.searchExec(this.searchTerms);
  },

  renderList: function (collection) {
    var filteredCollection = this.applyStateFilters(collection);

    // create a new view for the returned data
    if (this.browseListView) { this.browseListView.cleanup(); }

    if (this.options.target == 'projects' || this.options.target == 'tasks') {
      // projects and tasks get tiles
      $("#browse-map").hide();
      this.browseListView = new BrowseListView({
        el: '#browse-list',
        target: this.options.target,
        collection: filteredCollection
      });
      // Show draft filter
      var draft = _(collection).chain()
          .pluck('state')
          .indexOf('draft').value() >= 0;
      $(".draft-filter").toggleClass('hidden', !draft);

    } else {
      // profiles are in a table
      this.browseListView = new ProfileListView({
        el: '#browse-list',
        target: this.options.target,
        collection: filteredCollection
      });
    }
    $("#browse-search-spinner").hide();
    $("#browse-list").show();
    this.browseListView.render();

    popovers.popoverPeopleInit(".project-people-div");
  },

  renderMap: function (profiles) {
    // create a new view for the returned data. Need to show the div before
    // rendering otherwise the SVG borders will be wrong.
    if (this.browseMapView) { this.browseMapView.cleanup(); }
    $("#browse-map").show();
    this.browseMapView = new ProfileMapView({
      el: '#browse-map',
      people: profiles
    });
    this.browseMapView.render();
    // set up listeners for events from the map view
    this.listenTo(this.browseMapView, "browseSearchLocation", this.searchMap);
    this.listenTo(this.browseMapView, "browseRemove", this.searchRemove);
  },

  searchExec: function (terms) {
    var self = this;

    if (!terms || (terms.length == 0)) {
      // re-render everything collection
      var all = this.options.collection.toJSON();
      this.renderList(all);
      if (this.options.target == 'profiles') {
        this.renderMap(all);
      }
      return;
    }

    // create a search object
    var data = {
      items: [],
      tags: [],
      freeText: [],
      target: self.options.target
    };
    _.each(terms, function (t) {
      if ( t.unmatched ) {
        data.freeText.push(t.value);
      } else {
        data.items.push(t.id);
      }
    });
    $.ajax({
      url: '/api/search',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json'
    }).done(function (data) {
      // render the search results
      self.renderList(data);
    });
  },

  applyStateFilters: function (data) {

    if ( !_.isObject(data) || !$("#stateFilters").length ){ return data; }
    var keepers = [];
    //get check stateFilter inputs
    var inputs = $(".stateFilter:checked");

    _.each(data,function(item){
      _.each(inputs,function(test){
         if ( item.state == test.value ){
           keepers.push(item);
         }
      });
    });

    return keepers;
  },

  searchTagRemove: function (e) {
    if (e.preventDefault) e.preventDefault();

    var self = this;

    if ( $(e.currentTarget).hasClass("stateFilter") ){
      if ( $("#search-tags").length > 0 ) {
        var parent = $("#search-tags");
        var id = "search-tags";
        var project = false;
      }
    } else {
      var parent = $(e.currentTarget).parents('li')[0];
      var id = $(parent).data('id');
      var type = $($(e.currentTarget).parents('ul')[0]).attr('id');
      var project = false;

      if (type == 'search-projs') {
        project = true;
      }
    }

    for (i in self.searchTerms) {
      if (self.searchTerms[i].id == id) {
        if (project && self.searchTerms[i].title) {
          self.searchTerms.splice(i, 1);
          break;
        } else if (self.searchTerms[i].name) {
          self.searchTerms.splice(i, 1);
          break;
        }
      }
    }

    if ( !$(e.currentTarget).hasClass("stateFilter") ){
      parent.remove();
    }
    if (self.searchTerms.length == 0) {
      $("#search-none").show();
      $(".search-clear").hide();
    }
    self.searchExec(self.searchTerms);
  },

  searchRemove: function (options) {
    // remove all tags of a type
    var i = 0;
    while (i < this.searchTerms.length) {
      if (this.searchTerms[i].type == options.type) {
        $("#search-projs").children().filter('[data-id="' + this.searchTerms[i].id + '"]').remove();
        this.searchTerms.splice(i, 1);
      }
      i++;
    }
    if ($("#search-projs").children().length == 0 && $("#search-tags").children().length == 0) {
      $(".search-clear").hide();
    }
    if (options.render) {
      this.searchExec(this.searchTerms);
    }
  },

  searchClear: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.searchTerms = [];
    $("#search-projs").children().remove();
    $("#search-tags").children().remove();
    $("#search-none").show();
    $(".search-clear").hide();
    this.searchExec(self.searchTerms);
  },

  cleanup: function() {
    if (this.browseMapView) { this.browseMapView.cleanup(); }
    if (this.browseListView) { this.browseListView.cleanup(); }
    removeView(this);
  }

});

module.exports = BrowseMainView;
