var Sails = require('sails'),
    tasks = require('./import.json'),
    async = require('async');

Sails.lift(function(err, sails) {
  if (err) throw err;

  // Disable email notifications
  Notification.create = function(obj, done) { done(); };

  // Override the usual timestamps
  Task.beforeUpdate = function(obj, done) { done(); };

  // Add additional data to imported tasks
  tasks.map(function(task) {

    // User should be set to Lisa Nelson's ID
    task.userId = 1;

    // Set timestamps to creation date
    switch (task.state) {
      case 'open':
        task.publishedAt = task.createdAt;
        break;
      case 'assigned':
        task.publishedAt = task.createdAt;
        task.assignedAt = task.createdAt;
        break;
      case 'completed':
        task.publishedAt = task.createdAt;
        task.assignedAt = task.createdAt;
        task.completedAt = task.createdAt;
        break;
    }

    return task;
  });

  // Create tasks
  async.eachSeries(tasks, Task.create, done);

  // Log results
  function done(err) {
    if (err) return console.error(err);
    console.log('Added ' + tasks.length + ' tasks.');
    sails.lower();
  }

});
