var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var    async = require('async');
var   marked = require('marked');
var  TimeAgo = require('../../../../../vendor/jquery.timeago');
var BaseView = require('../../../../base/base_view');

var ProjectCollection = require('../../../../entities/projects/projects_collection');

// var CommentListController = require('../../../comments/list/controllers/comment_list_controller');
// var VolunteerSupervisorNotifyTemplate = require('../templates/volunteer_supervisor_notify_template.html');
// var      TaskEditFormView = require('../../edit/views/task_edit_form_view');
var            ApplyModal = require('../../../application/views/application_modal');
var        AttachmentView = require('../../../attachment/views/attachment_show_view');
var               TagView = require('../../../tag/show/views/tag_show_view');
var            TagFactory = require('../../../../components/tag_factory');
var        ModalComponent = require('../../../../components/modal');
var            ModalAlert = require('../../../../components/modal_alert');
var        MarkdownEditor = require('../../../../components/markdown_editor');
var VolunteerTextTemplate = require('../templates/volunteer_text_template.html');
var   ChangeStateTemplate = require('../templates/change_state_template.html');
var    UpdateNameTemplate = require('../templates/update_name_template.html');
var      CopyTaskTemplate = require('../templates/copy_task_template.html');

var TaskShowTemplate = require('../templates/task_show_item_template.html');
// var AlertTemplate = require('../../../../components/alert_template.html');
// var ShareTemplate = require('../templates/task_share_template.txt');






var TaskItemView = BaseView.extend({

  events: {
    'change .validate'                    : 'v',
    'keyup .validate'                     : 'v',
    'click #task-apply'                   : 'apply',
    'click #task-save'                    : 'submit',
    'click #task-close'                   : 'close',
    'click #task-reopen'                  : 'reopen',
    'click .link-backbone'                : linkBackbone,
    // 'click #task-view'                    : 'view',
    // 'click #like-button'                  : 'like',
    // 'click #volunteer'                    : 'volunteer',
    // 'click #volunteered'                  : 'volunteered',
    // 'click #task-copy'                    : 'copy',
    // 'click .delete-volunteer'             : 'removeVolunteer',
  },

  initialize: function (options) {
    var self = this;

    this.options = options;
    this.action  = options.action;
    this.edit    = (options.action == 'edit');

    this.tagFactory = new TagFactory();
  },

  render: function() {

    var data = {
      edit:  this.edit,
      user:  window.cache.currentUser,
      model: this.model.toJSON(),
      ui:    UIConfig,
      vol:   ((!window.cache.currentUser || window.cache.currentUser.id !== this.model.get('userId')) &&
               this.model.get('state') !== 'draft'),
    };

    // convert description from markdown to html
    data.model.descriptionHtml = marked(data.model.description);

    this.$el.html(_.template(TaskShowTemplate)(data));
    this.$el.i18n();
    
    $("time.timeago").timeago();
    
    /*
    if (window.location.search === '?volunteer' &&
        !this.model.get("volunteer")) {
      $('#volunteer').click();
      Backbone.history.navigate(window.location.pathname, {
        trigger: false,
        replace: true
      });
    }
    */

    // this.updateTaskEmail();
    this.initializeStateButtons();
    this.initializeVolunteers();
    this.initializeAttachment();
    this.initializeTags();
    this.initializeMD();

    if(this.edit)
      this.renderEdit();

    return this;
  },

  renderEdit: function() {
    var self = this;

    //load the "associated project" dropdown
    var projectCollection = new ProjectCollection();
    this.listenTo(projectCollection, "sync", function() {

      var formatResult = function (model, container, query) {
        var formatted = '<div class="select2-result-title">' + _.escape(model.get('title')) + '</div>';
        formatted    += '<div class="select2-result-description">' + marked(model.get('description')) + '</div>';
        return formatted;
      };

      self.$("#task-project").select2({
        placeholder:             "Select a project to associate",
        width:                   "250px",
        multiple:                false,
        formatResult:            formatResult,
        formatSelection:         formatResult,
        allowClear:              true,
        minimumResultsForSearch: Infinity, //not text searchable
        data:                    projectCollection.models, // the list of projects to choose from
      });

      //if this task is attached to a project, load it into the dropdown
      if(self.model.get("projectId"))
      {
        var current_project = projectCollection.findWhere({id: self.model.get("projectId")});
        if(current_project) self.$("#task-project").select2('data', current_project);
      }

    });
    projectCollection.fetch(); //will trigger the "sync" above

    //load time data
    this.$('#applyBy').datetimepicker({
      defaultDate: this.model.get("applyBy"),
    });

    this.$('#startedBy').datetimepicker({
      defaultDate: this.model.get("startedBy"),
    });

    this.$('#completedBy').datetimepicker({
      defaultDate: this.model.get("completedBy"),
    });

  },

  initializeAttachment: function() {
    if (this.attachmentView) this.attachmentView.cleanup();
    this.attachmentView = new AttachmentView({
      target: 'task',
      id: this.model.get("id"),
      state: this.model.get("state"),
      owner: this.model.get("isOwner"),
      volunteer: this.model.get("volunteer"),
      el: '.attachment-wrapper'
    }).render();
  },

  initializeTags: function() {
    if (this.tagView) this.tagView.cleanup();
    this.tagView = new TagView({
      el:     this.el,
      edit:   this.edit,
      target: 'task',
      tags:   this.model.get("tags"),
    }).render();
  },

  initializeVolunteers: function () {
    if (this.model.get("volunteer")) {
      this.$('.volunteer-true').show();
      this.$('.volunteer-false').hide();
    } else {
      this.$('.volunteer-true').hide();
      this.$('.volunteer-false').show();
    }
  },

  initializeStateButtons: function() {
    this.listenTo(this.model, "task:update:state:success", function (data) {
      if (data.attributes.state == 'closed') {
        this.$("#li-task-close").hide();
        this.$("#li-task-reopen").show();
        this.$("#alert-closed").show();
      } else {
        this.$("#li-task-close").show();
        this.$("#li-task-reopen").hide();
        this.$("#alert-closed").hide();
      }
    });
  },

  /*
  initializeComments: function() {
    if (self.commentListController) self.commentListController.cleanup();
    self.commentListController = new CommentListController({
      target: 'task',
      id: self.model.get('id'),
    });
  },
  */

  /*
  initializeLikes: function () {
    $("#like-number").text(this.model.get("likeCount"));
    if (parseInt(this.model.get("likeCount")) === 1) {
      $("#like-text").text($("#like-text").data('singular'));
    } else {
      $("#like-text").text($("#like-text").data('plural'));
    }
    if (this.model.get("like")) {
      $("#like-button-icon").removeClass('fa fa-star-o');
      $("#like-button-icon").addClass('fa fa-star');
    }
  },
  */

  initializeMD: function() {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: this.model.get("description"),
      el: ".markdown-edit",
      id: 'description',
      placeholder: 'Job description',
      title: 'Job description',
      rows: 12,
    }).render();
  },

  v: function (e) {
    return validate(e);
  },

  submit: function(e) {
    if (e && e.preventDefault) e.preventDefault();
    var self = this;

    var project = this.$("#task-project").select2('data');

    this.model.set({
      title:       this.$("#task-title").val(),
      description: this.$("#task-description textarea").val(),
      tags:        this.tagView.data(),
      projectId:   project ? project.get("id") : null,
      applyBy:     this.$("#applyBy").val()     || undefined,
      startedBy:   this.$("#startedBy").val()   || undefined,
      completedBy: this.$("#completedBy").val() || undefined,
    });

    this.$("#task-save").attr("disabled", "disabled");
    this.model.save({}, {
      success: function() {
        Backbone.history.navigate('tasks/' + self.model.toJSON().id, { trigger: true });
      },
    });
  },

  apply: function(e) {
    if (e.preventDefault) e.preventDefault();

    if(this.applyModal) this.applyModal.cleanup();
    this.applyModal = new ApplyModal({
      el: this.$("#apply-wrapper"),
      model: this.model,
    }).render();
  },

  close: function (e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    /*
    if (this.modalAlert) { this.modalAlert.cleanup(); }
    if (this.modalComponent) { this.modalComponent.cleanup(); }
    var states = UIConfig.states;
    if (draftAdminOnly && !window.cache.currentUser.permissions.admin) {
      states = _(states).reject(function(state) {
        return state.value === 'draft';
      });
    }

    var modalContent = _.template(ChangeStateTemplate)({model:self.model,states: states});
    this.modalComponent = new ModalComponent({
      el: "#modal-close",
      id: "check-close",
      modalTitle: "Change "+i18n.t("Task")+" State"
    }).render();

    this.modalAlert = new ModalAlert({
      el: "#check-close .modal-template",
      modalDiv: '#check-close',
      content: modalContent,
      cancel: 'Cancel',
      submit: 'Change '+i18n.t("Task")+' State',
      callback: function (e) {
        // user clicked the submit button
        self.model.trigger("task:update:state", $('input[name=opportunityState]:checked').val());
      }
    }).render();
    */
  },

  reopen: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.model.trigger("task:update:state", 'open');
  },

  copy: function (e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

    if (this.modalAlert) { this.modalAlert.cleanup(); }
    if (this.modalComponent) { this.modalComponent.cleanup(); }

    var modalContent = _.template(CopyTaskTemplate)();

    this.modalComponent = new ModalComponent({
      el: "#modal-copy",
      id: "check-copy",
      modalTitle: "Copy This Opportunity"
    }).render();

    this.modalAlert = new ModalAlert({
      el: "#check-copy .modal-template",
      modalDiv: '#check-copy',
      content: modalContent,
      validateBeforeSubmit: true,
      cancel: 'Cancel',
      submit: 'Copy Opportunity',
      callback: function (e) {
        $.ajax({
          url: '/api/task/copy',
          method: 'POST',
          data: {
            taskId: self.model.get("id"),
            title: $('#task-copy-title').val()
          }
        }).done(function(data) {
          self.options.router.navigate('/tasks/' + data.taskId + '/edit',
                                       { trigger: true });
        });
      }
    }).render();

    $('#task-copy-title').val('COPY ' + self.model.get("title"));
  },


  /*
  updateTaskEmail: function() {
    var subject = 'Take A Look At This Opportunity',
        data = {
          opportunityTitle: this.model.get('title'),
          opportunityLink: window.location.protocol +
            "//" + window.location.host + "" + window.location.pathname,
          opportunityDescription: this.model.get('description'),
          opportunityMadlibs: $('<div />', {
              html: this.$('#task-show-madlib-description').html()
            }).text().replace(/\s+/g, " ")
        },
        body = _.template(ShareTemplate)(data),
        link = 'mailto:?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);

    this.$('#email').attr('href', link);
  },
  */

  cleanup: function () {
    if(this.md)             this.md.cleanup();
    if(this.tagView)        this.tagView.cleanup();
    if(this.attachmentView) this.attachmentView.cleanup();
    if(this.taskItemView)   this.taskItemView.cleanup();
    if(this.applyModal)     this.applyModal.cleanup();
    // if (this.commentListController) { this.commentListController.cleanup(); }
    removeView(this);
  },

});

module.exports = TaskItemView;
