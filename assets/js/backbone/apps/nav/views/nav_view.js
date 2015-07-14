// Nav
//
// Note we need to take special care to not open up this view multiple times.
// Bootstrap modals do work with multiple modal opens, and that wouldn't make
// sense anyway. We do that via a variable here (doingLogin) that bypasses
// the render here, and is reset by a callback when the modal closes later.

var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var UIConfig = require('../../../config/ui.json');
var Login = require('../../../config/login.json');
var LoginController = require('../../login/controllers/login_controller');
var NavTemplate = require('../templates/nav_template.html');
var ProjectsCollection = require('../../../entities/projects/projects_collection');


var NavView = Backbone.View.extend({

  events: {
    'click .navbar-brand'   : linkBackbone,
    'click .nav-link'       : linkBackbone,
    'click .login'          : 'loginClick',
    'click .logout'         : 'logout'
  },

  initialize: function (options) {
    var self = this;
    this.options = options;
    this.projects = [];

    this.projectsCollection = new ProjectsCollection();

    this.projectsCollection.on("projects:fetch:success", function(collection) {
      self.projects = collection.map(function(project) {
        //don't show closed or archived groups
        if((project.get("state") != "open") ||
            project.get("archived"))
          return;
        return {
          title: project.get("title"),
          url: "/projects/" + project.get("id"),
        };
      });
      self.render();
    });

    this.projectsCollection.loadAll();

    /*
      Warning: This is a temporary hack to update the projects dropdown in the
               navbar.
      TODO: instead of using userEvents as a global event broker, there should
            be a system-wide Project Collection to avoid redundant fetch()es
    */
    this.listenTo(window.cache.userEvents, "project:save:success", function() {
      self.projectsCollection.loadAll(); //TODO: get rid of this, in favor of a global Project Collection
    });

    this.listenTo(window.cache.userEvents, "user:login:success", function (userData) {
      self.doRender({ user: userData });
    });

    this.listenTo(window.cache.userEvents, "user:login:close", function () {
      self.doingLogin = false;
    });

    this.listenTo(window.cache.userEvents, "user:logout", function () {
      self.doRender({ user: null });
      Backbone.history.loadUrl();
      window.cache.userEvents.trigger("user:logout:success");
    });

    // request that the user log in to see the page
    this.listenTo(window.cache.userEvents, "user:request:login", function (message) {
      // trigger the login modal
      self.login(message);
    });

    // update the navbar when the profile changes
    this.listenTo(window.cache.userEvents, "user:profile:save", function (data) {
      // reset the currentUser object
      window.cache.currentUser = data;
      // re-render the view
      self.render();
    });

    // update the user's photo when they change it
    this.listenTo(window.cache.userEvents, "user:profile:photo:save", function (url) {
      $(".navbar-people").attr('src', url);
    });
  },

  render: function () {
    var self = this;
    this.doRender({
      user: window.cache.currentUser,
      systemName: window.cache.system.name,
      projects: this.projects,
    });
    return this;
  },

  doRender: function (data) {
    data.login = Login;
    data.ui = UIConfig;
    var template = _.template(NavTemplate)(data);
    this.$el.html(template);
    this.$el.i18n();
  },

  loginClick: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.login();
  },

  login: function (message) {
    if (this.doingLogin) return;    // login modal already open, skip!
    this.doingLogin = true;
    if (this.loginController) {
      this.loginController.cleanup();
    }

    this.loginController = new LoginController({
      el: '#login-wrapper',
      message: message,
      navigate: ($(location).attr('pathname') === "/")
    });
  },

  logout: function (e) {
    if (e.preventDefault) e.preventDefault();
    $.ajax({
      url: '/api/auth/logout?json=true',
    }).done(function (success) {
      window.cache.currentUser = null;
      window.cache.userEvents.trigger("user:logout");
    }).fail(function (error) {
      // do nothing
    });
  },

  cleanup: function () {
    if (this.loginController) {
      this.loginController.cleanup();
    }
    removeView(this);
  }
});

module.exports = NavView;
