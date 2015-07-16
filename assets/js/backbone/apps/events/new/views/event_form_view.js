
var Bootstrap = require('bootstrap');
var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var EventsCollection = require('../../../../entities/events/events_collection');
var EventFormTemplate = require('../templates/event_form_template.html');


var EventFormView = Backbone.View.extend({

  el: "#event-list-wrapper",

  events: {
    // field validation
    "blur #event-title"       : "v",
    "blur #event-description" : "v",
    "blur #event-location"    : "v",
    // form submission
    "submit #event-form"      : "post"
  },

  initialize: function (options) {
    this.options = options;
  },

  initializeTimeZone: function () {
    var offset = (new Date()).getTimezoneOffset();
    var timezones = {
        '-12': 'Pacific/Kwajalein',
        '-11': 'Pacific/Samoa',
        '-10': 'Pacific/Honolulu',
        '-9': 'America/Juneau',
        '-8': 'America/Los Angeles',
        '-7': 'America/Denver',
        '-6': 'America/Mexico City',
        '-5': 'America/New York',
        '-4': 'America/Caracas',
        '-3.5': 'America/St Johns',
        '-3': 'America/Argentina/Buenos Aires',
        '-2': 'Atlantic/Azores',
        '-1': 'Atlantic/Azores',
        '0': 'Europe/London',
        '1': 'Europe/Paris',
        '2': 'Europe/Helsinki',
        '3': 'Europe/Moscow',
        '3.5': 'Asia/Tehran',
        '4': 'Asia/Baku',
        '4.5': 'Asia/Kabul',
        '5': 'Asia/Karachi',
        '5.5': 'Asia/Calcutta',
        '6': 'Asia/Colombo',
        '7': 'Asia/Bangkok',
        '8': 'Asia/Singapore',
        '9': 'Asia/Tokyo',
        '9.5': 'Australia/Darwin',
        '10': 'Pacific/Guam',
        '11': 'Asia/Magadan',
        '12': 'Asia/Kamchatka'
    };
    // create a timezone string for display
    var tz = timezones[-offset / 60];
    tz += ' (';
    if (offset <= 0) {
      tz += '+';
    }
    tz += (-offset/60) + ':00)';
    $('.timezone').html(tz);

    // set input pickers for time
    $('#event-start-time').timepicker({
      selectOnBlur: true,
      appendTo: '#div-event-start-time'
    });
    $('#event-end-time').timepicker({
      selectOnBlur: true,
      showDuration: true,
      durationTime: function() {
        return ($('#event-start-time').val());
      },
      appendTo: '#div-event-end-time'
    });
    // get the start time by rounding the current time to the nearest 30 minutes
    var coeff = 1000 * 60 * 30;
    var startTime = new Date();  //or use any other date
    startTime = new Date(Math.ceil(startTime.getTime() / coeff) * coeff)
    // the initial end time should be 1 hour after the initial start time
    var endTime = new Date(startTime.getTime() + 1000*60*60);
    $('#event-start-time').timepicker('setTime', startTime);
    $('#event-end-time').timepicker('setTime', endTime);

    // Initialize the date pickers
    var startDate = new Date();
    $('#event-start').datetimepicker({
      pickDate: true,
      pickTime: false,
      startDate: startDate
    });
    $('#event-end').datetimepicker({
      pickDate: true,
      pickTime: false,
      startDate: startDate
    });
    // Set the initial date to now (today)
    $('#event-start').data("DateTimePicker").setDate(startDate);
    $('#event-end').data("DateTimePicker").setDate(startDate);

    // When the start date changes,
    // set the end date to be at least the start date
    $('#event-start').on("change.dp",function (e) {
      $('#event-end').data("DateTimePicker").setStartDate(e.date);
      var diff = $('#event-end').data("DateTimePicker").getDate().unix() - e.date.unix();
      if (diff < 0) {
        $('#event-end').data("DateTimePicker").setDate(e.date);
      }
      $(e.currentTarget).blur();
    });
    // When the end date changes,
    // Enable/disable duration in the timepicker based on whether the
    // start and end dates match
    $('#event-end').on("change.dp",function (e) {
      var diff = e.date.unix() - $('#event-start').data("DateTimePicker").getDate().unix();
      if (diff === 0) {
        $('#event-end-time').timepicker('option', 'showDuration', true);
      } else {
        $('#event-end-time').timepicker('option', 'showDuration', false);
      }
      $(e.currentTarget).blur();
    });
  },

  render: function () {
    var template = _.template(EventFormTemplate);
    this.$el.html(template);
    this.initializeTimeZone();
  },

  v: function (e) {
    return validate(e);
  },

  post: function (e) {
    if (e.preventDefault) e.preventDefault();

    // validate the fields; if any is not validated, abort form submission
    var validateIds = ['#event-title', '#event-description', '#event-location'];
    var abort = false;
    for (i in validateIds) {
      var iAbort = validate({ currentTarget: validateIds[i] });
      abort = abort || iAbort;
    }
    if (abort) {
      return;
    }

    // process the form; create time objects
    var start = $('#event-start').data("DateTimePicker").getDate().clone().toDate();
    var end = $('#event-start').data("DateTimePicker").getDate().clone().toDate();
    start = $('#event-start-time').timepicker('getTime', start);
    end = $('#event-end-time').timepicker('getTime', end);

    var data = {
      title       : $("#event-title").val(),
      description : $("#event-description").val(),
      start       : start.toISOString(),
      end         : end.toISOString(),
      location    : $("#event-location").val(),
      projectId   : this.options.projectId
    };

    this.collection.trigger("event:save", data);
  },

  cleanup: function () {
    removeView(this);
  }

});

module.exports = EventFormView;
