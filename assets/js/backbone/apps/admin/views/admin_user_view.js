var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../mixins/utilities');

var          ProfileModel = require('../../../entities/profiles/profile_model');
var        ModalComponent = require('../../../components/modal');
var AdminUserPasswordView = require('./admin_user_password_view');
var     AdminUserTemplate = require('../templates/admin_user_template.html');
var        AdminUserTable = require('../templates/admin_user_table.html');
var              Paginate = require('../templates/admin_paginate.html');
var           LoginConfig = require('../../../config/login.json');


var AdminUserView = Backbone.View.extend({

  events: {
    "click a.page"              : "clickPage",
    "click .link-backbone"      : linkBackbone,
    "click .admin-user-enable"  : "enable",
    "click .admin-user-disable" : "disable",
    "click .admin-user-unlock"  : "unlock",
    "click .admin-user-resetpw" : "resetPassword",
    "change #permissions"       : "changePermissions",
    "keyup #user-filter"        : "filter",
  },

  initialize: function (options) {
    this.options = options;
    this.data = {
      page: 1
    };
  },

  render: function () {
    var self = this;
    Backbone.history.navigate('/admin/user');
    this.$el.show();
    if (this.rendered === true) {
      return this;
    }
    var data = {
      user: window.cache.currentUser,
      login: LoginConfig
    };
    var template = _.template(AdminUserTemplate)(data);
    this.$el.html(template);
    this.rendered = true;


    // fetch user data
    $.ajax({
      url: '/api/admin/findAllPermissions',
      dataType: 'json',
      success: function (data) {
        self.allPermissions = data.permissions;

        //trigger the first fetch (which triggers a render)
        self.fetchData(self, self.data);
      }
    });

    return this;
  },

  renderUsers: function (self, data) {
    data.urlbase = '/admin/users';
    data.q = data.q || '';
    // if the limit of results coming back hasn't been set yet
    // use the server's default
    if (!self.limit) self.limit = data.limit;
    data.trueLimit = self.limit;
    data.login = LoginConfig;
    data.user = window.cache.currentUser;
    data.allPermissions = this.allPermissions;
    // render the table
    var template = _.template(AdminUserTable)(data);
    // render the pagination
    var paginate = _.template(Paginate)(data);
    self.$("#user-page").html(paginate);
    self.$(".table-responsive").html(template);
    self.$(".btn").tooltip();
    // hide spinner and show results
    self.$(".spinner").hide();
    self.$(".table-responsive").show();
    self.$el.i18n();
  },

  clickPage: function (e) {
    var self = this;
    // if meta or control is held, or if the middle mouse button is pressed,
    // let the link process normally.
    // eg: open a new tab or window based on the browser prefs
    if ((e.metaKey === true) || (e.ctrlKey === true) || (e.which == 2)) {
      return;
    }
    if (e.preventDefault) e.preventDefault();
    // load this page of data
    this.fetchData(self, {
      page: $(e.currentTarget).data('page'),
      q: $($(e.currentTarget).parent('ul')[0]).data('filter'),
      limit: this.limit
    });
  },

  filter: function (e) {
    // get the input box value
    var val = $(e.currentTarget).val().trim();
    // if the filter is the same, don't do anything
    if (val == this.q) {
      return;
    }
    this.q = val;
    // hide the table and show the spinner
    this.$(".table-responsive").hide();
    this.$(".spinner").show();
    // fetch this query, starting from the beginning page
    this.fetchData(this, {
      q: val
    });
  },

  fetchData: function (self, data) {
    // perform the ajax request to fetch the user list
    $.ajax({
      url: '/api/admin/users',
      dataType: 'json',
      data: data,
      success: function (data) {
        self.data = data;
        self.renderUsers(self, data);
        $('.tip').tooltip();
      }
    });
  },




  spinnerForControl: function($target) {
    return $($($target.parent()[0]).children('.btn-spin')[0]);
  },

  controlToID: function($target) {
    return $($target.parents('tr')[0]).data('id');
  },

  /*
    Accepts attributes to update.
    You should always include the user's ID in the attributes hash
  */
  saveUserProperty: function(attributes, options) {
    //make a new model, and load it from the server
    var user = new ProfileModel();
    options = options || {};
    user.save(attributes, options);
  },

  enable: function (e) {
    if (e.preventDefault) e.preventDefault();
    var t       = $(e.currentTarget);
    var spinner = this.spinnerForControl(t);
    spinner.show();
    t.hide();

    this.saveUserProperty({
      id: this.controlToID(t),
      disabled: false,
    }, {
      success: function() {
        // hide the spinner
        spinner.hide();
        // show the opposite button
        $(t.siblings(".admin-user-disable")[0]).show();
      }
    });
  },

  disable: function (e) {
    if (e.preventDefault) e.preventDefault();
    var t       = $(e.currentTarget);
    var spinner = this.spinnerForControl(t);
    spinner.show();
    t.hide();

    this.saveUserProperty({
      id: this.controlToID(t),
      disabled: true,
    }, {
      success: function() {
        // hide the spinner
        spinner.hide();
        // show the opposite button
        $(t.siblings(".admin-user-enable")[0]).show();
      }
    });
  },

  unlock: function (e) {
    if (e.preventDefault) e.preventDefault();
    var t       = $(e.currentTarget);
    var spinner = this.spinnerForControl(t);
    spinner.show();
    t.hide();

    $.ajax({
      url: '/api/admin/unlock/' + this.controlToID(t),
      dataType: 'json',
      success: function (d) {
        // hide the spinner
        spinner.hide();
      }
    });
  },

  changePermissions: function(e) {
    if (e.preventDefault) e.preventDefault();
    var t = $(e.currentTarget);
    var spinner = this.spinnerForControl(t);
    spinner.show();
    t.hide();

    this.saveUserProperty({
      id: this.controlToID(t),
      permissions: t.val(),
    }, {
      success: function() {
        spinner.hide();
        t.show();
      },
    });
  },

  resetPassword: function (e) {
    if (e.preventDefault) e.preventDefault();
    if (this.passwordView) { this.passwordView.cleanup(); }
    if (this.modalComponent) this.modalComponent.cleanup();

    var tr = $($(e.currentTarget).parents('tr')[0]);
    var user = {
      id: tr.data('id'),
      name: $(tr.find('td.admin-table-name')[0]).text().trim()
    };

    // set up the modal
    this.modalComponent = new ModalComponent({
      el: "#reset-password-container",
      id: "reset-password-modal",
      modalTitle: "Reset Password"
    }).render();

    // initialize the view inside the modal
    this.passwordView = new AdminUserPasswordView({
      el: ".modal-template",
      user: user
    }).render();

    // render the modal
    this.$("#reset-password-modal").modal('show');
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AdminUserView;
