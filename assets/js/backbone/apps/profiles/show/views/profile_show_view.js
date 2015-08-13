var        _ = require('underscore');
var Backbone = require('backbone');
var    async = require('async');
var   marked = require('marked');
var jqIframe = require('blueimp-file-upload/js/jquery.iframe-transport');
var     jqFU = require('blueimp-file-upload/js/jquery.fileupload.js');
var    utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var    Login = require('../../../../config/login.json');

var  MarkdownEditor = require('../../../../components/markdown_editor');
var ProfileTemplate = require('../templates/profile_show_template.html');
var   ShareTemplate = require('../templates/profile_share_template.txt');
var  ModalComponent = require('../../../../components/modal');
var          PAView = require('./profile_activity_view');
var  AttachmentView = require('../../../attachment/views/attachment_show_view.js');
var     VetShowView = require('../../../vet/show/views/vet_show_view');
var        LangView = require('../../../languages/views/language_view');
var        LinkView = require('../../../links/views/link_view');
var         TagView = require('../../../tag/show/views/tag_show_view');


var ProfileShowView = Backbone.View.extend({

  events: {
    "submit #profile-form"       : "profileSubmit",
    "click #profile-save"        : "profileSave",
    "click .link-backbone"       : linkBackbone,
    "click #profile-cancel"      : "profileCancel",
    "click #like-button"         : "like",
    "keyup"                      : "fieldModified",
    "change"                     : "fieldModified",
    "blur"                       : "fieldModified",
    "click .removeAuth"          : "removeAuth"
  },

  initialize: function (options) {
    var self = this;
    this.options = options;
    this.data = options.data;
    this.data.newItemTags = [];
    this.edit = (this.options.action == 'edit');

    if (this.data.saved) {
      this.saved = true;
      this.data.saved = false;
    }
    // Handle email validation errors
    this.model.on('error', function(model, xhr) {
      var error = xhr.responseJSON;
      if (error.invalidAttributes && error.invalidAttributes.username) {
        var message = _(error.invalidAttributes.username)
              .pluck('message').join(', ')
              .replace(/record/g, 'user')
              .replace(/undefined/g, 'email')
              .replace(/`username`/g, 'email');
        self.$("#email-update-alert").html(message).show();
      }
    });
  },

  render: function () {
    var data = {
      login: Login,
      data: this.model.toJSON(),
      user: window.cache.currentUser || {},
      edit: this.edit,
      saved: this.saved,
      ui: UIConfig
    };

    data.email = data.data.username;

    if (data.data.bio) {
      data.data.bioHtml = marked(data.data.bio);
    }
    var template = _.template(ProfileTemplate)(data);
    this.$el.html(template);
    this.$el.i18n();

    // initialize sub components
    this.initializeFileUpload();
    this.initializeForm();
    // this.initializeLikes();
    this.initializeAttachments();
    this.initializeTags();
    this.initializeLangs();
    // this.initializePAView();
    this.initializeMarkdown();
    this.initializeVet();
    this.initializeLinks();
    this.updatePhoto();
    this.updateProfileEmail();
    return this;
  },

  initializeFileUpload: function () {
    var self = this;

    $('#fileupload').fileupload({
        url: "/api/file/create",
        dataType: 'text',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        formData: { 'type': 'image_square' },
        add: function (e, data) {
          self.$('#file-upload-progress-container').show();
          data.submit();
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          self.$('#file-upload-progress').css(
            'width',
            progress + '%'
          );
        },
        done: function (e, data) {
          var result;
          // for IE8/9 that use iframe
          if (data.dataType == 'iframe text') {
            result = JSON.parse(data.result);
          }
          // for modern XHR browsers
          else {
            result = JSON.parse($(data.result).text());
          }
          self.model.trigger("profile:updateWithPhotoId", result[0]);
        },
        fail: function (e, data) {
          // notify the user that the upload failed
          var message = data.errorThrown;
          self.$('#file-upload-progress-container').hide();
          if (data.jqXHR.status == 413) {
            message = "The uploaded file exceeds the maximum file size.";
          }
          self.$("#file-upload-alert").html(message);
          self.$("#file-upload-alert").show();
        }
    });

  },

  updateProfileEmail: function(){
    var subject = 'Take A Look At This Profile',
        data = {
          profileTitle: this.model.get('title'),
          profileLink: window.location.protocol +
            "//" + window.location.host + "" + window.location.pathname,
          profileName: this.model.get('name'),
          profileLocation: this.model.get('location') ?
            this.model.get('location').name : '',
          profileAgency: this.model.get('agency') ?
            this.model.get('agency').name : ''
        },
        body = _.template(ShareTemplate)(data),
        link = 'mailto:?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);

    this.$('#email').attr('href', link);
  },

  initializeAttachments: function() {
    this.attachmentView = new AttachmentView({
      el: this.$(".attachment-wrapper"),
      action: this.action,
      target: "user",
      owner: this.model.get("isOwner"),
      id: this.model.get("id"),
    }).render();
  },

  initializeTags: function() {
    if (this.tagView) { this.tagView.cleanup(); }
    this.tagView = new TagView({
      el: this.$el,
      tags: this.model.get("tags"),
      edit: this.edit,
      target: 'profile',
    }).render();
  },

  initializeLangs: function() {
    if (this.langView) this.langView.cleanup();
    this.langView = new LangView({
      el: this.$('.lang-wrapper'),
      edit: this.edit,
    }).render(this.model.get('languages'));
  },

  /*
  initializePAView: function () {
    if (this.projectView) { this.projectView.cleanup(); }
    if (this.taskView) { this.taskView.cleanup(); }
    if (this.volView) { this.volView.cleanup(); }
    $.ajax('/api/user/activities/' + this.model.attributes.id).done(function (data) {
      this.projectView = new PAView({
        model: this.model,
        el: '.project-activity-wrapper',
        target: 'project',
        handle: 'project',
        data: data.projects
      });
      this.projectView.render();
      this.taskView = new PAView({
        model: this.model,
        el: '.task-createdactivity-wrapper',
        target: 'task',
        handle: 'task',
        data: data.tasks
      });
      this.taskView.render();
      this.volView = new PAView({
        model: this.model,
        el: '.task-activity-wrapper',
        target: 'task',
        handle: 'volTask',
        data: data.volTasks
      });
      this.volView.render();

    });
  },
  */

  updatePhoto: function () {
    var self = this;
    this.model.on("profile:updatedPhoto", function (data) {
      var url = '/api/user/photo/' + data.attributes.id;
      // force the new image to be loaded
      $.get(url, function (data) {
        $("#project-header").css('background-image', "url('" + url + "')");
        $('#file-upload-progress-container').hide();
        // notify listeners of the new user image, but only for the current user
        if (self.model.toJSON().id == window.cache.currentUser.id) {
          window.cache.userEvents.trigger("user:profile:photo:save", url);
        }
      });
    });
  },

  initializeForm: function() {
    var self = this;

    this.listenTo(self.model, "profile:save:success", function (data) {
      // Bootstrap .button() has execution order issue since it
      // uses setTimeout to change the text of buttons.
      // make sure attr() runs last
      $("#submit").button('success');
      // notify listeners if the current user has been updated
      if (self.model.toJSON().id == window.cache.currentUser.id) {
        window.cache.userEvents.trigger("user:profile:save", data.toJSON());
      }

      setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled"); },0);
      $("#profile-save, #submit").removeClass("btn-primary");
      $("#profile-save, #submit").addClass("btn-success");
      self.data.saved = true;
      Backbone.history.navigate('profile/' + self.model.toJSON().id, { trigger: true });

    });

    this.listenTo(self.model, "profile:save:fail", function (data) {
      $("#submit").button('fail');
    });
    this.listenTo(self.model, "profile:removeAuth:success", function (data, id) {
      self.render();
    });
    // this.listenTo(self.model, "profile:input:changed", function (e) {
    // });
      $("#profile-save, #submit").button('reset');
      $("#profile-save, #submit").removeAttr("disabled");
      $("#profile-save, #submit").removeClass("btn-success");
      $("#profile-save, #submit").addClass("btn-c2");
  },

  /*
  initializeLikes: function() {
    $("#like-number").text(this.model.attributes.likeCount);
    if (parseInt(this.model.attributes.likeCount) === 1) {
      $("#like-text").text($("#like-text").data('singular'));
    } else {
      $("#like-text").text($("#like-text").data('plural'));
    }
    if (this.model.attributes.like) {
      $("#like-button-icon").removeClass('fa fa-star-o');
      $("#like-button-icon").addClass('fa fa-star');
    }
  },
  */

  initializeMarkdown: function () {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: this.model.toJSON().bio,
      el: ".markdown-edit",
      id: 'bio',
      placeholder: 'A short biography.',
      title: 'Biography',
      rows: 4
    }).render();
  },

  initializeVet: function() {
    if(this.vetView) this.vetView.cleanup();
    this.vetView = new VetShowView({
      el: this.$(".vet-wrapper"),
      model: this.model,
    }).render();
  },

  initializeLinks: function() {
    if(this.linkView) this.linkView.cleanup();
    this.linkView = new LinkView({
      el: this.$(".links-wrapper"),
      edit: this.edit,
    }).render(this.model.get('links'));
  },

  fieldModified: function (e) {

    //check that the name isn't a null string
    var $help = this.$("#profile-first-name").closest(".form-group").find(".help-block");
    $help.toggle( this.$("#profile-first-name").val() === "" );

    this.model.trigger("profile:input:changed", e);
  },

  profileCancel: function (e) {
    e.preventDefault();
    Backbone.history.navigate('profile/' + this.model.toJSON().id, { trigger: true });
  },

  profileSave: function (e) {
    e.preventDefault();
    $("#profile-form").submit();
  },

  profileSubmit: function (e) {
    e.preventDefault();
    var self = this;

    // If the name isn't valid, don't put the save through
    if (validate({ currentTarget: '#profile-first-name' })) return;
    if (validate({ currentTarget: '#profile-last-name' }))  return;

    var data = {
      firstname: $("#profile-first-name").val(),
      lastname:  $("#profile-last-name").val(),
      bio:       $(".profile-bio textarea").val(),
      username:  $("#profile-email").val(),
      tags:      this.tagView.data(),
      languages: this.langView.data(),
      links:     this.linkView.data(),
      // title: ,
    };

    if(!data.languages) return; //failed validation
    if(!data.links)     return; //failed validation

    $("#profile-save, #submit").button('loading');
    setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled"); }, 0);
    this.model.trigger("profile:save", data);
  },

  removeAuth: function (e) {
    if (e.preventDefault) e.preventDefault();
    var node = $(e.currentTarget);
    this.model.trigger("profile:removeAuth", node.data("service"));
  },

  like: function (e) {
    e.preventDefault();
    var self = this;
    var child = $(e.currentTarget).children("#like-button-icon");
    var likenumber = $("#like-number");
    // Not yet liked, initiate like
    if (child.hasClass('fa-star-o')) {
      child.removeClass('fa-star-o');
      child.addClass('fa fa-star');
      likenumber.text(parseInt(likenumber.text()) + 1);
      if (parseInt(likenumber.text()) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      $.ajax({
        url: '/api/like/likeu/' + self.model.attributes.id
      }).done( function (data) {
        // liked!
        // response should be the like object
        // console.log(data.id);
      });
    }
    // Liked, initiate unlike
    else {
      child.removeClass('fa-star');
      child.addClass('fa-star-o');
      likenumber.text(parseInt(likenumber.text()) - 1);
      if (parseInt(likenumber.text()) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      $.ajax({
        url: '/api/like/unlikeu/' + self.model.attributes.id
      }).done( function (data) {
        // un-liked!
        // response should be null (empty)
      });
    }
  },
  cleanup: function () {
    if (this.md)          this.md.cleanup();
    if (this.tagView)     this.tagView.cleanup();
    if (this.langView)    this.langView.cleanup();
    if (this.projectView) this.projectView.cleanup();
    if (this.taskView)    this.taskView.cleanup();
    if (this.volView)     this.volView.cleanup();
    if (this.vetView)     this.vetView.cleanup();
    if (this.linkView)    this.linkView.cleanup();
    removeView(this);
  }

});

module.exports = ProfileShowView;
