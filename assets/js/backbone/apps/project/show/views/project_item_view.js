var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var ProjectShowTemplate = require('../templates/project_item_view_template.html');
var ShareTemplate = require('../templates/project_share_template.txt');
var TagShowView = require('../../../tag/show/views/tag_show_view');


var ProjectShowView = Backbone.View.extend({

  el: "#container",

  events: {
  },

  initialize: function (options) {
    this.options = options;
    this.data = options.data;
    this.action = options.action;
    this.edit = false;
    if (this.options.action) {
      if (this.options.action == 'edit') {
        this.edit = true;
      }
    }
    this.data.newItemTags = [];
  },

  render: function () {
    var compiledTemplate;
    var data = {
      hostname: window.location.hostname,
      data: this.model.toJSON(),
      user: window.cache.currentUser || {},
      edit: this.edit
    };

    compiledTemplate = _.template(ProjectShowTemplate)(data);
    this.$el.html(compiledTemplate);
    this.$el.i18n();

    this.initializeToggle();
    // this.initializeFileUpload();
    // this.initializeTags();
    this.updatePhoto();
    this.updateProjectEmail();
    this.model.trigger("project:show:rendered");

    return this;
  },

  updatePhoto: function () {
    this.listenTo(this.model, "project:updated:photo:success", function (data) {
      var model = data.toJSON(), url;
      if (model.coverId) {
        url = '/api/file/get/' + model.coverId;
        $("#project-header").css('background-image', "url(" + url + ")");
      }
      $('#file-upload-progress-container').hide();
    });
  },

  updateProjectEmail: function() {
    var subject = 'Take A Look At This Project',
        data = {
          projectTitle: this.model.get('title'),
          projectLink: window.location.protocol +
            "//" + window.location.host + "" + window.location.pathname,
          projectDescription: this.model.get('description')
        },
        body = _.template(ShareTemplate)(data),
        link = 'mailto:?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);

    this.$('#email').attr('href', link);
  },

  initializeToggle: function () {
    if(this.edit){
      this.$('#editProject').find('.box-icon-text').html('View ' + i18n.t('Project'));
    }
    else{
      this.$('#editProject').find('.box-icon-text').html('Edit ' + i18n.t('Project'));
    }
  },

  /*
  initializeTags: function () {
    this.tagView = new TagShowView({
      model: this.model,
      el: '.tag-wrapper',
      target: 'project',
      targetId: 'projectId',
      edit: this.edit
    });
    this.tagView.render();
  },
  */

  /*
  initializeFileUpload: function () {
    var self = this;

    $('#fileupload').fileupload({
        url: "/api/file/create",
        dataType: 'text',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        formData: { 'type': 'image' },
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
          self.model.trigger("project:update:photoId", result[0]);
        },
        fail: function (e, data) {
          // notify the user that the upload failed
          var message = data.errorThrown;
          self.$('#file-upload-progress-container').hide();
          if (data.jqXHR.status == 413) {
            message = "The uploaded file exceeds the maximum file size.";
          }
          self.$(".file-upload-alert").html(message);
          self.$(".file-upload-alert").show();
        }
    });

  },
  */

  cleanup: function () {
    if (this.tagView) { this.tagView.cleanup(); }
    removeView(this);
  },
});

module.exports = ProjectShowView;
