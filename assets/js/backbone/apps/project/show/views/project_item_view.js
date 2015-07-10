var _ = require('underscore');
var Backbone = require('backbone');
var utils = require('../../../../mixins/utilities');
var ProjectShowTemplate = require('../templates/project_item_view_template.html');
var ShareTemplate = require('../templates/project_share_template.txt');


var ProjectShowView = Backbone.View.extend({

  el: "#container",

  events: {
  },

  initialize: function (options) {
    this.options = options;
    this.data = options.data;
    this.action = options.action;
    this.edit = (this.options.action == 'edit');
  },

  render: function () {
    var compiledTemplate;
    var data = {
      hostname: window.location.hostname,
      data:     this.model.toJSON(),
      user:     window.cache.currentUser || {},
      edit:     this.edit
    };

    compiledTemplate = _.template(ProjectShowTemplate)(data);
    this.$el.html(compiledTemplate);
    this.$el.i18n();

    this.initializeToggle();
    this.updateProjectEmail();
    this.model.trigger("project:show:rendered");

    return this;
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

  cleanup: function () {
    removeView(this);
  },
});

module.exports = ProjectShowView;
