var        _ = require('underscore');
var Backbone = require('backbone');
var    utils = require('../../../../mixins/utilities');
var UIConfig = require('../../../../config/ui.json');
var    async = require('async');
var   marked = require('marked');
var  TimeAgo = require('../../../../../vendor/jquery.timeago');
var BaseView = require('../../../../base/base_view');


// var CommentListController = require('../../../comments/list/controllers/comment_list_controller');
// var VolunteerSupervisorNotifyTemplate = require('../templates/volunteer_supervisor_notify_template.html');
// var      TaskEditFormView = require('../../edit/views/task_edit_form_view');
var        AttachmentView = require('../../../attachment/views/attachment_show_view');
var               TagView = require('../../../tag/show/views/tag_show_view');
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





var Popovers = require('../../../../mixins/popovers');
var popovers = new Popovers();




var TaskItemView = BaseView.extend({

  events: {
    'change .validate'                    : 'v',
    'keyup .validate'                     : 'v',
    'click #task-save'                    : 'submit',
    'click #task-view'                    : 'view',
    "click #like-button"                  : 'like',
    'click #volunteer'                    : 'volunteer',
    'click #volunteered'                  : 'volunteered',
    "click #task-close"                   : "stateChange",
    "click #task-reopen"                  : "stateReopen",
    "click #task-copy"                    : "copy",
    "click .delete-volunteer"             : 'removeVolunteer',
    "mouseenter .project-people-show-div" : popovers.popoverPeopleOn,
    "click .project-people-show-div"      : popovers.popoverClick,
    "click .link-backbone"                : linkBackbone,
  },


  initialize: function (options) {
    var self = this;

    this.options = options;
    this.action  = options.action;
    this.edit    = (options.action == 'edit');
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
        !this.model.attributes.volunteer) {
      $('#volunteer').click();
      Backbone.history.navigate(window.location.pathname, {
        trigger: false,
        replace: true
      });
    }
    */

    popovers.popoverPeopleInit(".project-people-show-div");

    // this.updateTaskEmail();
    this.initializeStateButtons();
    this.initializeVolunteers();
    this.initializeAttachment();
    this.initializeTags();
    this.initializeMD();

  },

  initializeAttachment: function() {
    if (this.attachmentView) this.attachmentView.cleanup();
    this.attachmentView = new AttachmentView({
      target: 'task',
      id: this.model.attributes.id,
      state: this.model.attributes.state,
      owner: this.model.attributes.isOwner,
      volunteer: this.model.attributes.volunteer,
      el: '.attachment-wrapper'
    }).render();
  },

  initializeTags: function() {
    if (this.tagView) this.tagView.cleanup();
    this.tagView = new TagView({
      el: this.el,
      edit: this.edit,
      target: 'task',
    }).render();
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

  initializeVolunteers: function () {
    if (this.model.attributes.volunteer) {
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

  initializeMD: function() {
    if (this.md) { this.md.cleanup(); }
    this.md = new MarkdownEditor({
      data: this.model.toJSON().bio,
      el: ".markdown-edit",
      id: 'description',
      placeholder: 'Job description',
      title: 'Job description',
      rows: 4
    }).render();
  },

  v: function (e) {
    return validate(e);
  },

  submit: function(e) {
    if (e && e.preventDefault) e.preventDefault();
    console.log("submit");
  },

  edit: function (e) {
    if (e.preventDefault) e.preventDefault();
    this.initializeEdit();
    popovers.popoverPeopleInit(".project-people-div");
    Backbone.history.navigate('tasks/' + this.model.id + '/edit');
  },

  view: function (e) {
    if (e.preventDefault) e.preventDefault();
    Backbone.history.navigate('tasks/' + this.model.id, { trigger: true });
  },

  /*
  like: function (e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;
    var child = $(e.currentTarget).children("#like-button-icon");
    var likenumber = $("#like-number");
    // Not yet liked, initiate like
    if (child.hasClass('fa-star-o')) {
      child.removeClass('fa-star-o');
      child.addClass('fa-star');
      likenumber.text(parseInt(likenumber.text()) + 1);
      if (parseInt(likenumber.text()) === 1) {
        $("#like-text").text($("#like-text").data('singular'));
      } else {
        $("#like-text").text($("#like-text").data('plural'));
      }
      $.ajax({
        url: '/api/like/liket/' + this.model.attributes.id
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
        url: '/api/like/unliket/' + this.model.attributes.id
      }).done( function (data) {
        // un-liked!
        // response should be null (empty)
      });
    }
  },
  */

  /*
  getUserSettings: function (userId) {
    //does this belong somewhere else?
    if ( _.isNull(userId) ){ return null; }
    $.ajax({
      url: '/api/usersetting/'+userId.id,
      type: 'GET',
      dataType: 'json'
    })
    .success(function(data){
      _.each(data,function(setting){
        //save active settings to the current user object
        if ( setting.isActive ){
          window.cache.currentUser[setting.key]=setting;
        }
      });
    });
  },
  */

  /*
  deleteUserSettingByKey: function(settingKey) {
    //this function expects the entire row from usersetting in the form
    //     window.cache.currentUser[settingKey] = {}
    var self = this;

    //if not set skip
    var targetId =  ( window.cache.currentUser[settingKey] ) ? window.cache.currentUser[settingKey].id : null ;

    if ( targetId ){
      $.ajax({
        url: '/api/usersetting/'+targetId,
        type: 'DELETE',
        dataType: 'json'
      })
    }

  },
  */

  /*
  saveUserSettingByKey: function(userId, options) {
    //this function expects the entire row from usersetting in the form
    //     window.cache.currentUser[settingKey] = {}
    var self = this;

    //are values the same, stop
    if ( options.newValue == options.oldValue ) { return true; }

    //if delete old is set, delete exisitng value
    //   default is delete
    if ( !options.deleteOld ){
      self.deleteUserSettingByKey(options.settingKey);
    }

    $.ajax({
        url: '/api/usersetting/',
        type: 'POST',
        dataType: 'json',
        data: {
          userId: userId,
          key: options.settingKey,
          value: options.newValue
        }
      });
  },
  */

  volunteer: function (e) {
    if (e.preventDefault) e.preventDefault();
    if (!window.cache.currentUser) {
      Backbone.history.navigate(window.location.pathname + '?volunteer', {
        trigger: false,
        replace: true
      });
      window.cache.userEvents.trigger("user:request:login");
    } else {
      var self = this;
      var child = $(e.currentTarget).children("#like-button-icon");
      var originalEvent = e;

      if (this.modalAlert) { this.modalAlert.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }

      // If user's profile has no name, ask them to enter one
      if (!window.cache.currentUser.name) {
        var modalContent = _.template(UpdateNameTemplate)({});
        this.modalComponent = new ModalComponent({
          el: "#modal-volunteer",
          id: "update-name",
          modalTitle: "What's your name?"
        }).render();
        this.modalAlert = new ModalAlert({
          el: "#update-name .modal-template",
          modalDiv: '#update-name',
          content: modalContent,
          validateBeforeSubmit: true,
          cancel: i18n.t('volunteerModal.cancel'),
          submit: i18n.t('volunteerModal.ok'),
          callback: function(e) {
            var name = $('#update-name-field').val();
            $.ajax({
              url: '/api/user/' + window.cache.currentUser.id,
              method: 'PUT',
              data: { name: name }
            }).done(function(user) {
              window.cache.currentUser.name = user.name;
              self.volunteer(originalEvent);
            });
          }
        }).render();
        return;
      }

      this.modalComponent = new ModalComponent({
        el: "#modal-volunteer",
        id: "check-volunteer",
        modalTitle: i18n.t("volunteerModal.title")
      }).render();

      // if ( UIConfig.supervisorEmail.useSupervisorEmail ) {
      //   //not assigning as null because null injected into the modalContent var shows as a literal value
      //   //    when what we want is nothing if value is null
      //   var supervisorEmail = ( window.cache.currentUser.supervisorEmail ) ? window.cache.currentUser.supervisorEmail.value  : "";
      //   var supervisorName = ( window.cache.currentUser.supervisorName ) ? window.cache.currentUser.supervisorName.value : "";
      //   var validateBeforeSubmit = true;
      //   var modalContent = _.template(VolunteerSupervisorNotifyTemplate)({supervisorEmail: supervisorEmail,supervisorName: supervisorName});
      // } else {
        validateBeforeSubmit = false;
        var modalContent = _.template(VolunteerTextTemplate)({});
      // }

      this.modalAlert = new ModalAlert({
        el: "#check-volunteer .modal-template",
        modalDiv: '#check-volunteer',
        content: modalContent,
        cancel: i18n.t('volunteerModal.cancel'),
        submit: i18n.t('volunteerModal.ok'),
        validateBeforeSubmit: validateBeforeSubmit,
        callback: function (e) {
          /*
          if ( UIConfig.supervisorEmail.useSupervisorEmail ) {
            self.saveUserSettingByKey(window.cache.currentUser.id,{settingKey:"supervisorEmail",newValue: $('#userSuperVisorEmail').val(),oldValue: supervisorEmail});
            self.saveUserSettingByKey(window.cache.currentUser.id,{settingKey:"supervisorName",newValue: $('#userSuperVisorName').val(),oldValue: supervisorName});
          }
          */

          // user clicked the submit button
          $.ajax({
            url: '/api/volunteer/',
            type: 'POST',
            data: {
              taskId: self.model.attributes.id
            }
          }).done( function (data) {
            $('.volunteer-true').show();
            $('.volunteer-false').hide();
            var html = '<div class="project-people-div" data-userid="' + data.userId + '" data-voluserid="' + data.userId + '"><img src="/api/user/photo/' + data.userId + '" class="project-people"/>';
            if (self.options.action === "edit") {
              html += '<a href="#" class="delete-volunteer volunteer-delete fa fa-times"  id="delete-volunteer-' + data.id + '" data-uid="' + data.userId + '" data-vid="' +  data.id + '"></a>';
            }
            html += '</div>';
            $('#task-volunteers').append(html);
            popovers.popoverPeopleInit(".project-people-div");
          });
        }
      }).render();
    }
  },

  volunteered: function (e) {
    if (e.preventDefault) e.preventDefault();
    // Not able to un-volunteer, so do nothing
  },

  removeVolunteer: function(e) {
    if (e.stopPropagation()) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    $(e.currentTarget).off("mouseenter");
    $('.popover').remove();

    var vId = $(e.currentTarget).data('vid');
    var uId = $(e.currentTarget).data('uid');
    var self = this;

    if (typeof cache !== "undefined")
    {
      $.ajax({
        url: '/api/volunteer/' + vId,
        type: 'DELETE',
        data: {
          taskId: this.model.attributes,
          vId: vId
        },
      }).done(function (data) {
          // done();
      });
    }

    var oldVols = this.model.attributes.volunteers || [];
    var unchangedVols = _.filter(oldVols, function(vol){ return ( vol.id !== vId ); } , this)  || [];
    this.model.attributes.volunteers = unchangedVols;
    $('[data-voluserid="' + uId + '"]').remove();
    if (window.cache.currentUser.id === uId) {
      $('.volunteer-false').show();
      $('.volunteer-true').hide();
    }
  },

  stateChange: function (e) {
    if (e.preventDefault) e.preventDefault();
    var self = this;

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
  },

  stateReopen: function (e) {
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
            taskId: self.model.attributes.id,
            title: $('#task-copy-title').val()
          }
        }).done(function(data) {
          self.options.router.navigate('/tasks/' + data.taskId + '/edit',
                                       { trigger: true });
        });
      }
    }).render();

    $('#task-copy-title').val('COPY ' + self.model.attributes.title);
  },


  cleanup: function () {
    if (this.md)               this.md.cleanup();
    if (this.tagView)          this.tagView.cleanup();
    if (this.attachmentView)   this.attachmentView.cleanup();
    if (this.taskItemView)     this.taskItemView.cleanup();
    // if (this.taskEditFormView) this.taskEditFormView.cleanup();
    // if (this.commentListController) { this.commentListController.cleanup(); }
    removeView(this);
  }






























  //this is the orginal task view code

  /*
  render: function (self) {
    self.data = {
      user: window.cache.currentUser,
      model: self.model.toJSON(),
      tags: self.model.toJSON().tags,
      edit: self.edit,
    };

    self.data['madlibTags'] = organizeTags(self.data.tags);
    // convert description from markdown to html
    self.data.model.descriptionHtml = marked(self.data.model.description);
    self.model.trigger('task:tag:data', self.tags, self.data['madlibTags']);

    var d = self.data,
        vol = ((!d.user || d.user.id !== d.model.userId) && d.model.state !== 'draft');
    self.data.ui = UIConfig;
    self.data.vol = vol;
    var compiledTemplate = _.template(TaskShowTemplate)(self.data);
    self.$el.html(compiledTemplate);
    self.$el.i18n();
    $("time.timeago").timeago();
    self.updateTaskEmail();
    self.model.trigger('task:show:render:done');
    if (window.location.search === '?volunteer' &&
        !self.model.attributes.volunteer) {
      $('#volunteer').click();
      Backbone.history.navigate(window.location.pathname, {
        trigger: false,
        replace: true
      });
    }
  },

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

  initializeTags: function (self) {
    var types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate"];

    self.tagSources = {};

    var requestAllTagsByType = function (type, cb) {
      $.ajax({
        url: '/api/ac/tag?type=' + type + '&list',
        type: 'GET',
        async: false,
        success: function (data) {
          // Dynamically create an associative
          // array based on that for the pointer to the list itself to be iterated through
          // on the front-end.
          self.tagSources[type] = data;
          return cb();
        }
      });
    }

    async.each(types, requestAllTagsByType, function (err) {
      self.model.trigger('task:tag:types', self.tagSources);
      self.render(self);
    });
  },

  cleanup: function() {
    removeView(this);
  }
  */
});

module.exports = TaskItemView;
