
var        _ = require('underscore');
var Backbone = require('backbone');
var    async = require('async');
var    utils = require('../../../../mixins/utilities');

var             Popovers = require('../../../../mixins/popovers');
var       BaseController = require('../../../../base/base_controller');
var      ProjectItemView = require('../views/project_item_view');
var ProjectownerShowView = require('../../../projectowner/show/views/projectowner_show_view');
var   TaskListController = require('../../../tasks/list/controllers/task_list_controller');
var        AlertTemplate = require('../../../../components/alert_template.html');


var popovers = new Popovers();

Project = {};

Project.ShowController = BaseController.extend({

  el: "#container",

  // Set the model to null, before it is fetched from the server.
  // This allows us to clear out the previous data from the list_view,
  // and get ready for the new data for the project show view.
  model: null,

  events: {
    "mouseenter .project-people-show-div" : popovers.popoverPeopleOn,
    "click      .project-people-show-div" : popovers.popoverClick
  },

  initialize: function (options) {
    var self = this;

    this.router = options.router;
    this.id     = options.id;
    this.data   = options.data;
    this.action = options.action;

    //fetch the model
    this.listenTo(this.model, "project:model:fetch:success", function (projectModel) {
      self.model = projectModel;

      if(options.action == 'edit')
      {
        var allowed_to_edit = (self.model.get('isOwner') ||
                              (window.cache.currentUser && window.cache.currentUser.isAdmin));

        if(!allowed_to_edit)
        {
          window.cache.userEvents.trigger("user:request:login", {
            message: "You are not the owner of this project. <a class='link-backbone' href='/projects/" + _.escape(self.model.get('id')) + "'>View the project instead.</a>",
            disableClose: true
          });
          self.action = ""; //don't render the editor
        }
      }

      self.render();
    });

    this.listenTo(this.model, "project:model:fetch:error", function (projectModel, xhr) {
      //this template is populated by the Global AJAX error listener
      var template = _.template(AlertTemplate)();
      self.$el.html(template);
    });

    this.model.on("project:show:rendered", function () {
      self.initializeOwners();
      self.initializeUI();
    });

    //this fetch will trigger the handlers above to get things started
    this.model.trigger("project:model:fetch", this.model.id);
  },

  render: function() {
    if (this.projectShowItemView) this.projectShowItemView.cleanup();
    this.projectShowItemView = new ProjectItemView({
      model: this.model,
      action: this.action,
      data: this.data
    }).render();
  },

  initializeOwners : function() {
    if (this.projectownerShowView) this.projectownerShowView.cleanup();
    this.projectownerShowView = new ProjectownerShowView({
      model: this.model,
      action: this.action,
      data: this.data
     }).render();
  },

  initializeUI: function() {
    popovers.popoverPeopleInit(".project-people-show-div");
  },

  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function() {
    // if (this.taskListController) this.taskListController.cleanup();
    if (this.projectShowItemView) this.projectShowItemView.cleanup();
    if (this.projectownerShowView) this.projectownerShowView.cleanup();
    removeView(this);
  }

});

module.exports = Project.ShowController;
