
var Bootstrap = require('bootstrap');
var _ = require('underscore');
var TimeAgo = require('../../../../vendor/jquery.timeago');
var Backbone = require('backbone');
var utils = require('../../../mixins/utilities');
var async = require('async');
var AITemplate = require('../templates/attachment_item_template.html');
var ASTemplate = require('../templates/attachment_show_template.html');



var AttachmentShowView = Backbone.View.extend({

  events: {
    'click .file-delete' : 'deleteAttachment',
  },

  /*
    @param {String}  options.target       -   The model name to attach files to
    @param {Integer} options.id           -   The Id of the target model to attach files to
    @param {Boolean} options.is_private   -   Whether to prevent public access to this file
    @param {Boolean} options.auto_attach  -   Whether to create an attachment relation for this file
    @param {Boolean} options.auto_upload  -   Whether to upload files when they are selected (else, you will need to call `.upload()`)

    upon a successful file upload (not yet attached), this view will emit the even:

    "file:upload:success"

    If auto_attach is set to true, this event will automatically be handled by the
    `attach()` function
  */
  initialize: function (options) {
    this.options     = options;
    this.id          = options.id;
    this.target      = options.target;
    this.is_private  = options.is_private  || true;
    this.auto_upload = options.auto_upload || true;
    this.auto_attach = options.auto_attach || true;
    this.files       = [];
  },

  initializeFiles: function () {
    var self = this;

    $.ajax({
      url: '/api/attachment/findAllBy' + this.target + 'Id/' + this.id
    }).done(function (data) {

      if (data && (data.length > 0)) {
        self.$(".attachment-none").hide();
      }

      _.each(data, function (attachment) {
        self.$(".attachment-tbody").append(self.renderFile(attachment.file, attachment.id));
      });

      $("time.timeago").timeago();
    });
  },


  initializeFileUpload: function () {
    var self = this;

    //if files should be attached to the given targets, then register
    //the upload handler to be the file attacher.
    if(this.auto_attach)
      this.listenTo(this, "file:upload:success", this.attach);

    $('#attachment-fileupload').fileupload({
      url: "/api/file/create",
      dataType: 'text',
      acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
      formData: { 'private': self.is_private },
      add: function (e, data) {
        self.data = data;
        if(self.auto_upload)
          self.upload();
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        self.$('.attachment-fileupload .progress-bar').css('width', progress + '%');
      },
      done: function (e, data) {
        if (data.dataType == 'iframe text')
          var result = JSON.parse(data.result); // for IE8/9 that use iframe
        else
          var result = JSON.parse($(data.result).text()); // for modern XHR browsers

        //save the file object
        var file = result[0];
        self.files.push(file);

        self.$('.attachment-fileupload > .progress').hide();
        self.renderNewFile(file);

        //broadcast the event that upload was successful
        self.trigger("file:upload:success", file);
      },
      fail: function (e, data) {
        self.$('.attachment-fileupload > .progress').hide();

        // notify the user that the upload failed
        var message = data.errorThrown;
        if (data.jqXHR.status == 413) {
          message = "The uploaded file exceeds the maximum file size.";
        }

        self.$(".file-upload-alert > span").html(message)
        self.$(".file-upload-alert").show();
      }
    });

  },

  render: function () {

    data = {
      user: window.cache.currentUser,
      canAdd:
        // Admins
        window.cache.currentUser && window.cache.currentUser.permissions.admin ||
        // Project creator
        (this.target ==='project' && this.options.owner) ||
        // Profile owner
        (this.target ==='user' && this.options.owner) ||
        // Task creators for open tasks
        (
          this.target ==='task' &&
          this.options.owner &&
          ['open', 'assigned'].indexOf(this.options.state) !== -1
        ) ||
        // Participants for assigned tasks
        (
          this.target ==='task' &&
          this.options.volunteer &&
          this.options.state === 'assigned'
        )
    };
    var template = _.template(ASTemplate)(data);
    this.$el.html(template);
    this.initializeFileUpload();
    this.initializeFiles();
    return this;
  },

  renderFile: function (file, attach_id) {
    return _.template(AITemplate)({
      file:      file,
      attach_id: attach_id,
      target:    this.target,
      user:      window.cache.currentUser,
      owner:     this.options.owner,
    });
  },

  upload: function(e) {
    if(e && e.preventDefault) e.preventDefault();
    this.$('.attachment-fileupload > .progress').show();
    this.data.submit();
  },

  attach: function(file) {
    //create an attachment relationship with the given file (already uploaded)
    //or, the most recently uploaded file
    file = file || this.files[this.files.length - 1];

    //find this file's row in the table
    var $file = this.$("tr[data-id='" + file.id + "']");
    $file.find(".file-tag-waiting").show();

    // store id in the database with the file
    var data = { fileId: file.id };
    data[this.target + 'Id'] = this.id;

    $.ajax({
      url:         '/api/attachment',
      type:        'POST',
      dataType:    'json',
      contentType: 'application/json',
      data:        JSON.stringify(data),
    }).done(function (attachment) {
      $file.find(".file-tag-waiting").hide();
      $file.find(".file-delete").show();
      $file.data("attach-id", attachment.id);
    });
  },

  renderNewFile: function (file) {
    $(".attachment-none").hide();
    // put new at the top of the list rather than the bottom
    $(".attachment-tbody").prepend(this.renderFile(file));
    $("time.timeago").timeago();
  },

  deleteAttachment: function (e) {
    if(e && e.preventDefault) e.preventDefault();

    var attach_id = $(e.currentTarget).closest("tr").data('attach-id');

    $.ajax({
      url: '/api/attachment/' + attach_id,
      type: 'DELETE',
      success: function (d) {
        // remove from the DOM
        $(e.currentTarget).closest('tr').remove();
        var len = $(e.currentTarget).parents('tbody').eq(0).children().length;
        if(len == 2) $(".attachment-none").show();
      }
    });
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = AttachmentShowView;
