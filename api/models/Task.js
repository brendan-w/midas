/*---------------------
    :: Task
    -> model
---------------------*/
var exportUtils = require('../services/utils/export');

module.exports = {

  attributes: {
    // Current state of the task
    state: {
        type: 'STRING',
        enum: ['open','public','assigned', 'closed','archived','completed'],
        defaultsTo: sails.config.taskState || 'open',
    },
    // user id of the task owner
    userId: 'INTEGER',
    // project id of the parent project
    projectId: 'INTEGER',
    // title of the task
    title: 'STRING',
    // description of the task
    description: 'STRING',

    // application deadline
    applyBy: 'datetime',
    // start time
    startedBy: 'datetime',
    // end time
    completedBy: 'datetime',
    // duration
    duration: 'STRING',


    publishedAt: 'datetime',
    assignedAt: 'datetime',
    completedAt: 'datetime',

    // Tag association
    tags: {
      collection: 'tagEntity',
      via: 'tasks',
      dominant: true
    },

    isOpen: function(){
        if ( _.indexOf(['open','public','assigned'],this.state) != -1 ){
            return true;
        }
        return false;
    },

    isClosed: function(){
        if ( _.indexOf(['closed','archived','completed'],this.state) != -1 ){
            return true;
        }
        return false;
    }
  },

  exportFormat: {
    'project_id': 'projectId',
    'name': {field: 'title', filter: exportUtils.nullToEmptyString},
    'description': {field: 'description', filter: exportUtils.nullToEmptyString},
    'created_date': {field: 'createdAt', filter: exportUtils.excelDateFormat},
    'published_date': {field: 'publishedAt', filter: exportUtils.excelDateFormat},
    'assigned_date': {field: 'createdAt', filter: exportUtils.excelDateFormat},
    'creator_name': {field: 'creator_name', filter: exportUtils.nullToEmptyString},
    'signups': 'signups'
  },

  beforeUpdate: function(values, done) {
    Task.findOne({ id: values.id }).exec(function(err, task) {
      if (err) done(err);

      // If task state hasn't changed, continue
      if (task && task.state === values.state) return done();

      // If new task or state has changed, update timestamps
      var action = false;
      switch (values.state) {
        case 'open':
          values.publishedAt = new Date();
          break;
        case 'assigned':
          values.assignedAt = new Date();
          action = 'task.update.assigned';
          break;
        case 'completed':
          values.completedAt = new Date();
          //Not implemented: action = 'taskCompleted';
          break;
      }

      // If no notification specified, continue
      if (!values.id || !action) return done();

      // Set up notification for updates (needs to happen here instead
      // of afterUpdate so we can compare to see if state changed)
      Notification.create({
        action: action,
        model: values
      }, done);

    });
  },

  beforeCreate: function(values, done) {
    // If default state is not draft, we need to set dates
    this.beforeUpdate(values, done);
  },

  afterCreate: function(model, done) {
    Notification.create({
      action: 'task.create.thanks',
      model: model
    }, done);
  }

};
