/**
 * This is the main application bootstrap
 * that gets the rest of the apps, routers, etc
 * running.
 */

// Set CSRF header
$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
  var token;
  if (!options.crossDomain) {
    token = $('meta[name="csrf-token"]').attr('content');
    if (token) {
      return jqXHR.setRequestHeader('X-CSRF-Token', token);
    }
  }
});

// Install jQuery plugins
require('blueimp-file-upload/js/vendor/jquery.ui.widget');
i18n = require('i18next-client/i18next.commonjs.withJQuery');
moment = require('moment');
require('bootstrap-datetimepicker/src/js/bootstrap-datetimepicker');
require('timepicker/jquery.timepicker');

// Set markdown defaults
var marked = require('marked');
marked.setOptions({
  sanitize: true
});

// App
window.Application = window.Application || {};
window.cache = {
  userEvents: {},
  currentUser: null,
  system: {}
};

// Events
window.entities = { request: {} };
rendering       = {};

// Set up Backbone to use jQuery
_ = require('underscore');
Backbone = require('backbone');
Backbone.$ = jQuery;

// Global AJAX error listener. If we ever get an auth error, prompt to log
// in otherwise show the error.
$(function () {
  $(document).ajaxError(function (e, jqXHR, settings, errorText) {
    $('.spinner').hide();
    if (jqXHR.status === 401 || jqXHR.status === 403) {
      if (!window.cache || !window.cache.userEvents
        || !('trigger' in window.cache.userEvents)) return;
      window.cache.userEvents.trigger("user:request:login", {
        disableClose: false,
        message: jqXHR.responseJSON.message || ""
      });
    } else {

      //looks for local alerts whos parents are visible.
      //If none are found, this falls back on the global alert
      //(prevents global forms like login and register from stealing errors)
      var alert = $("*:visible > .alert-local");
      if(alert.length == 0)
        alert = $('.alert-global');

      //if a message was returned, show it
      if(jqXHR.responseJSON && jqXHR.responseJSON.message)
        alert.html(jqXHR.responseJSON.message);
      else
        alert.html("<strong>An unknown error occurred</strong>. Please contact your system administrator.");

      alert.show();
    }
  });
});

// Load the application
var appr = require('./app-run');
appr.initialize();
