
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../mixins/utilities');
var NavView = require('../nav/views/nav_view');
var FooterView = require('../footer/views/footer_view');
var BrowseListController = require('./controllers/browse_list_controller');
var ProjectModel = require('../../entities/projects/project_model');
var ProjectShowController = require('../project/show/controllers/project_show_controller');
var ProfileShowController = require('../profiles/show/controllers/profile_show_controller');
var TaskModel = require('../../entities/tasks/task_model');
var TaskShowController = require('../tasks/show/controllers/task_show_controller');
var AdminMainController = require('../admin/controllers/admin_main_controller');
var VetListController = require('../vet/list/controllers/vet_list_controller');
var HomeController = require('../home/controllers/home_controller');
var LoginModal = require('../login/views/login_modal');
var RegisterModal = require('../register/views/register_modal');
var TalentController = require('../talent/controllers/talent_controller');
var StaticView = require('../static/views/static_view');

var BrowseRouter = Backbone.Router.extend({

  routes: {
    ''                          : 'showHome',
    'projects(/)(?:queryStr)'   : 'listProjects',
    'projects/:id(/)'           : 'showProject',
    'projects/:id/:action(/)'   : 'showProject',
    'tasks(/)(?:queryStr)'      : 'listTasks',
    'tasks/:id(/)'              : 'showTask',
    'tasks/:id/:action(/)'      : 'showTask',
    'profiles(/)(?:queryStr)'   : 'listProfiles',
    'profile(/)'                : 'showProfile',
    'profile/:id(/)'            : 'showProfile',
    'profile/:id(/)/:action'    : 'showProfile',
    'admin(/)'                  : 'showAdmin',
    'admin(/):action(/)'        : 'showAdmin',
    'vet(/)'                    : 'showVet',
    'faq(/)'                    : 'showFaq',
    'about(/)'                  : 'showAbout',
    'talent(/)'                 : 'showTalent',
    'terms(/)'                  : 'showTerms',
    'privacy(/)'                : 'showPrivacy',
  },

  data: { saved: false },

  initialize: function () {
    var self = this;

    //create site-wide components
    this.navView = new NavView({
      el: 'header'
    }).render();

    this.footerView = new FooterView({
      el: 'footer'
    }).render();

    this.loginModal = new LoginModal({
      el: '#login-wrapper',
      navigate: ($(location).attr('pathname') === "/")
    });

    this.registerModal = new RegisterModal({
      el: '#register-wrapper'
    });

    // set navigation state
    this.on('route', function(route, params) {
      self.navView.render(); //re-render the nave
      $(".alert-global").hide();
    });
  },

  cleanupChildren: function () {
    if (this.browseListController)  this.browseListController.cleanup();
    if (this.projectShowController) this.projectShowController.cleanup();
    if (this.profileShowController) this.profileShowController.cleanup();
    if (this.taskShowController)    this.taskShowController.cleanup();
    if (this.homeController)        this.homeController.cleanup();
    if (this.adminMainController)   this.adminMainController.cleanup();
    if (this.vetListController)     this.vetListController.cleanup();
    if (this.faqController)         this.faqController.cleanup();
    if (this.staticView)            this.staticView.cleanup();
    if (this.talentController)      this.talentController.cleanup();
    this.data = { saved: false };
  },

  showHome: function () {
    this.cleanupChildren();
    this.homeController = new HomeController({
      target: 'home',
      el: '#container',
      router: this,
      data: this.data
    });
  },

  showFaq: function () {
    this.cleanupChildren();
    this.staticView = new StaticView({
      el: "#container",
      page: "faq",
    });
  },

  showTerms: function () {
    this.cleanupChildren();
    this.staticView = new StaticView({
      el: "#container",
      page: "terms",
    });
  },

  showPrivacy: function () {
    this.cleanupChildren();
    this.staticView = new StaticView({
      el: "#container",
      page: "privacy",
    });
  },

  showAbout: function () {
    this.cleanupChildren();
    this.staticView = new StaticView({
      el: "#container",
      page: "about",
    });
  },

  showTalent: function () {
    this.cleanupChildren();
    this.talentController = new TalentController({
      el: '#container',
      router: this,
    });
  },

  parseQueryParams: function (str) {
    var params = {};
    if (str) {
      var terms = str.split('&');
      for (var i = 0; i < terms.length; i++) {
        var nameValue = terms[i].split('=');
        if (nameValue.length == 2) {
          params[nameValue[0]] = nameValue[1];
        } else {
          params[terms[i]] = '';
        }
      }
    }
    return params;
  },

  listProjects: function (queryStr) {
    this.cleanupChildren();
    this.browseListController = new BrowseListController({
      target: 'projects',
      el: '#container',
      router: this,
      queryParams: this.parseQueryParams(queryStr),
      data: this.data,
    });
  },

  listTasks: function (queryStr) {
    this.cleanupChildren();
    this.browseListController = new BrowseListController({
      target: 'tasks',
      el: '#container',
      router: this,
      queryParams: this.parseQueryParams(queryStr),
      data: this.data,
    });
  },

  listProfiles: function (queryStr) {
    this.cleanupChildren();
    this.browseListController = new BrowseListController({
      target: 'profiles',
      el: '#container',
      router: this,
      queryParams: this.parseQueryParams(queryStr),
      data: this.data,
    });
  },

  showProject: function (id, action) {
    this.cleanupChildren();
    
    var model = new ProjectModel();
    model.set({ id: id });
    
    this.projectShowController = new ProjectShowController({
      data: this.data,
      model: model,
      router: this,
      id: id,
      action: action,
    });
  },

  showTask: function (id, action) {
    this.cleanupChildren();
    
    var model = new TaskModel();
    model.set({ id: id });
    
    this.taskShowController = new TaskShowController({
      model: model,
      router: this,
      id: id,
      action: action,
      data: this.data,
    });
  },

  showProfile: function (id, action) {
    this.cleanupChildren();

    // normalize input
    if(id)     id     = id.toLowerCase();
    if(action) action = action.toLowerCase();

    // normalize actions that don't have ids
    if (!action && id) {
      if (id == 'edit') {
        action = id;
        id = window.cache.currentUser.id;
      }
      else if (id == 'settings') {
        action = id;
        id = window.cache.currentUser.id;
      }
    }

    this.profileShowController = new ProfileShowController({
      id: id,
      action: action,
      data: this.data,
    });
  },

  showAdmin: function (action) {
    this.cleanupChildren();
    this.adminMainController = new AdminMainController({
      el: "#container",
      action: action,
    });
  },

  showVet: function() {
    this.cleanupChildren();
    this.vetListController = new VetListController({
      el: "#container",
    });
  },

});

var initialize = function () {
  var router = new BrowseRouter();
  return router;
};

module.exports = {
  initialize: initialize
};
