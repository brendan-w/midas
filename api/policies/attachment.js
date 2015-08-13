module.exports = function(req, res, next) {

  // Admins can do anything
  if (req.user.permissions.admin) return next();

  // Attachments require a task or project
  if (req.param('taskId')) {

    // Find task to check permissions
    Task.findOne({ id: req.param('taskId') }).exec(function(err, task) {
      if (err || !task) return res.badRequest('Error uploading file.');

      // Task creators can attach to open tasks
      if (task.userId === req.user.id && task.isOpen()) return next();

      // Task volunteers can attach to assigned tasks
      if (task.state === 'assigned') {
        Volunteer.findOne({
          userId: req.user.id,
          taskId: task.id
        }).exec(function(err, volunteer) {
          if (volunteer) return next();
          return res.forbidden();
        });
      } else {
        return res.forbidden();
      }
    });

  } else if (req.param('projectId')) {

    ProjectOwner.find({
      projectId: req.param('projectId')
    }).exec(function(err, owners) {
      if (err || !owners) return res.badRequest('Error uploading file.');

      // Task creators can attach to projects
      if (_.pluck(owners, 'userId').indexOf(req.user.id) !== -1) return next();
      return res.forbidden();
    });

  } else if (req.param('userId')) {
    //Check that the user owns this profile
    if(req.param('userId') == req.user.id)
      return next();
    else
      return res.forbidden('You are only allowed to edit attachments on your own profile.');

  } else {
    return res.forbidden('Files must be attached to a task, project, or user.');
  }


};
