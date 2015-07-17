
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var Popovers = require('../../../../mixins/popovers');
var EventsCollection = require('../../../../entities/events/events_collection');
var EventCollectionView = require('../views/event_collection_view');
var ModalComponent = require('../../../../components/modal');
var EventFormView = require('../../new/views/event_form_view');


var popovers = new Popovers();

EventList = Backbone.View.extend({

  el: "#event-list-wrapper",

  events: {
    'click .add-event'                : 'add',
    'click .rsvp'                     : 'toggleRSVP',
    'click .delete-project-event'     : 'deleteEvent',
    'mouseenter .data-event-flag-true': 'buttonRSVPOn',
    'mouseleave .data-event-flag-true': 'buttonRSVPOff',
    "mouseenter .project-people-div"  : popovers.popoverPeopleOn,
    "click .project-people-div"       : popovers.popoverClick
  },

  initialize: function (settings) {
    var self = this;
    this.options = _.extend(settings, this.defaults);
    this.requestEventsCollectionData();
  },

  requestEventsCollectionData: function () {
    var self = this;
    this.collection = new EventsCollection();
    this.collection.fetch({
      url: '/api/event/findAllByProjectId/' + parseInt(this.options.projectId),
      success: function (collection) {
        self.collection = collection;
        self.renderEventCollectionView(collection);
      }
    })
  },

  renderEventCollectionView: function (collection) {
    var self = this;
    this.listenTo(this.collection, "event:save:success", function (model) {
      $('#addEvent').bind('hidden.bs.modal', function() {
        self.requestEventsCollectionData();
        if (this.eventFormView) this.eventFormView.cleanup();
        if (this.modalComponent) this.modalComponent.cleanup();
      }).modal('hide');
    });

    if (this.eventCollectionView) {
      this.eventCollectionView.cleanup();
    }

    this.eventCollectionView = new EventCollectionView({
      el: "#event-list-wrapper",
      onRender: true,
      collection: collection,
      projectId: this.options.projectId
    });

    popovers.popoverPeopleInit(".project-people-div");
  },

  add: function (e) {
    if (e.preventDefault) e.preventDefault();

    // cleanup existing views
    if (this.eventFormView) this.eventFormView.cleanup();
    if (this.modalComponent) this.modalComponent.cleanup();

    // instantiate the modal with the event form view
    this.modalComponent = new ModalComponent({
      el: "#event-modal-add",
      id: "addEvent",
      modalTitle: 'Add Event'
    }).render();

    this.eventFormView = new EventFormView({
      el: "#event-modal-add .modal-template",
      projectId: this.options.projectId,
      collection: this.collection
    }).render();

    $('#addEvent').bind('hidden.bs.modal', function() {
      $('#addEvent').remove();
    }).modal('hide');

  },

  updatePeople: function (e, inc) {
    var peopleDiv = $($(e.currentTarget).parents('.event')[0]).find('.event-people')[0];
    var numDiv = $(peopleDiv).children('.event-people-number');
    var newNum = parseInt($(numDiv).html());
    if (inc) {
      newNum++
    } else {
      newNum--;
    }
    // Don't allow race conditions to set the number of people below zero
    if (newNum < 0) {
      newNum = 0;
    }
    $(numDiv).html(newNum);
    var textDiv = $(peopleDiv).children('.event-people-text')[0];
    if (newNum == 1) {
      $(textDiv).html($(textDiv).data('singular'));
    } else {
      $(textDiv).html($(textDiv).data('plural'));
    }
  },

  buttonRSVPOn: function (e) {
    $(e.currentTarget).button('hover');
  },

  buttonRSVPOff: function (e) {
    $(e.currentTarget).button('going');
  },

  deleteEvent: function (e) {
    var self = this;
    if (e.preventDefault) e.preventDefault();
    var id = $($(e.currentTarget).parents('div.event')[0]).data('id');

    if ( window.cache.currentUser && window.cache.currentUser.permissions.admin ) {
      $.ajax({
        url: '/api/event/' + id,
        type: 'DELETE',
      }).done(function (data) {
          self.requestEventsCollectionData();
      });
    }
  },

  toggleRSVP: function (e) {
    var self = this;
    if (e.preventDefault) e.preventDefault();
    // get the id from the parent event div
    var id = $($(e.currentTarget).parents('div.event')[0]).data('id');
    if ($(e.currentTarget).hasClass("rsvp") && $(e.currentTarget).hasClass("data-event-flag-true") === false) {
      $(e.currentTarget).removeClass("data-event-flag-false");
      $(e.currentTarget).addClass("data-event-flag-true");
      $(e.currentTarget).button('going');
      self.updatePeople(e, true);
      $.ajax({
        url: '/api/event/attend/' + id,
        success: function (data) {
        }
      });
    } else {
      $(e.currentTarget).removeClass("data-event-flag-true");
      $(e.currentTarget).addClass("data-event-flag-false");
      $(e.currentTarget).button('rsvp');
      self.updatePeople(e, false);
      $.ajax({
        url: '/api/event/cancel/' + id,
        success: function (data) {
        }
      })
    }
  },

  cleanup: function () {
    if (this.eventCollectionView) this.eventCollectionView.cleanup();
    if (this.eventFormView) this.eventFormView.cleanup();
    if (this.modalComponent) this.modalComponent.cleanup();
    removeView(this);
  }

});

module.exports = EventList
