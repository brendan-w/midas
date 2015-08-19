var _ = require('underscore');
var Backbone = require('backbone');
var async = require('async');
var utils = require('../../../mixins/utilities');
var UIConfig = require('../../../config/ui.json');
var marked = require('marked');
var TagConfig = require('../../../config/tag');
var ProjectListItem = require('../templates/project_list_item.html');
var TaskListItem = require('../templates/task_list_item.html');
var NoListItem = require('../templates/no_search_results.html');
var TasksCollection = require('../../../entities/tasks/tasks_collection');


var BrowseListView = Backbone.View.extend({

  initialize: function (options) {
    var self = this;

    var pageSize = 27;
    if (UIConfig.browse && UIConfig.browse.pageSize)
      pageSize = UIConfig.browse.pageSize;

    this.options = options;
    this.data = {
      pageSize: pageSize,
      page: 1
    };
    $(window).on('scroll',function(e){
      self.scrollCheck(e);
    });
  },

  organizeTags: function (tags) {
    // put the tags into their types
    return _(tags).groupBy('type');
  },

  scrollCheck: function(e) {
    var currentScrollPos = $(window).scrollTop();
    var currentMaxHeight = $('#container').height();
    var buffer           = 600;

    if ( (this.options.collection.length / this.data.page) > 1 && Math.ceil(this.options.collection.length / this.data.pageSize) >= this.data.page && currentScrollPos + buffer > currentMaxHeight ){
      this.data.page += 1;
      this.render();
    }
  },

  render: function () {

    //settings for infinite scroll
    if ( UIConfig.browse && UIConfig.browse.useInfiniteScroll ) {
      if ( this.data.page == 1 ){
        var start = 0;
      } else {
        var start = (this.data.page-1) * this.data.pageSize;
      }
      var limit = start + this.data.pageSize;
    } else {
      //reset page to 1 and return
      if ( this.data.page > 1 ) {
        this.data.page = 1;
        return this;
      }
      var limit = this.options.collection.length;
      var start = 0;
    }

    if ( this.options.collection.length == 0 ){
      var settings = {
        ui: UIConfig
      };
      compiledTemplate = _.template(NoListItem)(settings);
      this.$el.append(compiledTemplate);
    } else {

      for ( var i = start; i < limit; i++ ) {

        var model = this.options.collection[i];
        if(!model)
          break;

        var item = {
          item: model,
          user: window.cache.currentUser,
          tags: {},
          // tagConfig: TagConfig,
          // tagShow: ['location', 'skill', 'topic', 'task-time-estimate', 'task-time-required']
        };

        //do some pre-processing for the view


        if(this.options.collection[i].tags)
          item.tags = _(this.options.collection[i].tags).groupBy('type');
        
        if(!item.tags.location)
          item.tags.location = []; //ensures that the view is always able to iterate

        if(this.options.collection[i].description)
          item.item.descriptionHtml = marked(this.options.collection[i].description);

        //compile the template

        var compiledTemplate = '';

        if(this.options.target == 'projects')
          compiledTemplate = _.template(ProjectListItem)(item);
        else
          compiledTemplate = _.template(TaskListItem)(item);

        //display it
        this.$el.append(compiledTemplate);
      }
    }
    this.$el.i18n();
    return this;
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = BrowseListView;
