var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../../mixins/utilities');
var    async = require('async');

var                 Popovers = require('../../../../mixins/popovers');
var           ModalComponent = require('../../../../components/modal');
var ProjectownerShowTemplate = require('../templates/projectowner_show_template.html');


//create the popovers context
var popovers = new Popovers();

var ProjectownerShowView = Backbone.View.extend({

  el: "#projectowner-wrapper",
  model : null,

  // Set the model to null, before it is fetched from the server.
  // This allows us to clear out the previous data from the list_view,
  // and get ready for the new data for the project show view.
  // model: null,

  events: {
    "click button.owner-form-toggle"      : "toggleOwners",
    "click #owner-save"                   : "saveOwners",
    "click #owner-cancel"                 : "initializeOwnerSelect2",
    "click .delete-projectowner"          : "removeOwner",

    "mouseenter .project-people-show-div" : popovers.popoverPeopleOn,
    "click      .project-people-show-div" : popovers.popoverClick,
  },

  // The initialize method is mainly used for event bindings (for effeciency)
  initialize: function (options) {
    var self = this;
    this.options = options;
    this.data = options.data;
    this.action = options.action;
    this.user = window.cache.currentUser || {};
    if (this.options.action) {
      if (this.options.action == 'edit') {
        this.edit = true;
      }
    }

    this.model.on("projectowner:show:rendered", function () {
      self.initializeOwnerSelect2();
      popovers.popoverPeopleInit(".project-people-show-div");
    });

    //when owner set is updated, re-render and re-init popovers
    this.model.on("project:update:owners:success", function (data) {
      self.render();
      if (_.isUndefined(popovers)) {
        var popovers = new Popovers();
        popovers.popoverPeopleInit(".project-people-div");
      }
    });

  },

  render: function () {
    var compiledTemplate;
    var data = {
      data: this.model.toJSON(),
      user: this.user
    };
    data.data.edit = this.edit;
    compiledTemplate = _.template(ProjectownerShowTemplate)(data);
    this.$el.html(compiledTemplate);
    this.$el.i18n();

    this.model.trigger("projectowner:show:rendered", data);
    return this;
  },

  initializeOwnerSelect2: function () {
    var self = this;
    if ((this.model.attributes.isOwner || this.user.permissions.admin) && this.edit){
      var formatResult = function (object, container, query) {
        return object.name;
      };
      var oldOwners = this.model.attributes.owners || [];
      var oldOwnerIds = _.map(oldOwners, function(owner){ return owner.userId }) || [];

      self.$("#owners").select2({
        placeholder: 'Add ' + i18n.t('Project') + ' Owners',
        multiple: true,
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 1,
        ajax: {
            url: '/api/ac/user',
            dataType: 'json',
            data: function (term) {
              return {
                q: term
              };
            },
            results: function (data) {
              return { results: _.filter(data, function(user){  return _.indexOf( oldOwnerIds, user.id) >= 0 ? false : true; }, self ) };
          }
        }
      });

      self.$('#owner-edit').show();

    }
    else
    {
      self.$('#owner-edit').hide();
    }

    self.$('#project-owners-form').hide();
    self.$('#project-owners-show').show();
    self.$('#owner-save').hide();
    self.$('#owner-cancel').hide();

  },

  toggleOwners : function(e){
    if (!(this.model.attributes.isOwner || this.user.permissions.admin) && this.edit) return false;
    $('.owner-form-toggle').toggle(400);
  },

  saveOwners : function(e){
    if (e.preventDefault) e.preventDefault();
    if (!(this.model.attributes.isOwner || this.user.permissions.admin) && this.edit) return false;
    var self = this;

    var pId = self.model.attributes.id;

    var oldOwners = this.model.attributes.owners || [];
    var s2data = $("#owners").select2("data")  || [];
    var s2OwnerIds = _.map(s2data, function(owner){ return owner.id }) || [];

    async.each(s2OwnerIds, createOwner, function(){ self.model.trigger("projectowner:show:changed", oldOwners); });

    $("#owners").select2("data", []);

    function createOwner(ownerID, done){
      var self = this;
      $.ajax({
          url: '/api/projectowner/',
          type: 'POST',
          data: {
            projectId: pId,
            userId: ownerID
          },
          success : function(data){
            var POId = data.id;
            oldOwners.push({ id:POId, userId: ownerID});
          }

        }).done(function (data) {
          done();
        });
    };

  },

  removeOwner: function(e) {
    if (e.stopPropagation()) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    $(e.currentTarget).off("mouseenter");
    $('.popover').remove();

    var pOId = $(e.currentTarget).data('poid');
    var uId = $(e.currentTarget).data('uid');
    var self = this;

    if (typeof cache !== "undefined" && uId !== cache.currentUser.id)
    {
      $.ajax({
        url: '/api/projectowner/' + pOId,
        type: 'DELETE',
      }).done(function (data) {
          // done();
      });
    }

    var oldOwners = this.model.attributes.owners || [];
    var unchangedOwners = _.filter(oldOwners, function(owner){ return ( owner.id !== pOId ); } , this)  || [];
    self.model.trigger("projectowner:show:changed", unchangedOwners);
  },




  // ---------------------
  //= Utility Methods
  // ---------------------
  cleanup: function() {
    removeView(this);
  }

});

module.exports = ProjectownerShowView;
