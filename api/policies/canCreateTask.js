/**
* Check the users permissions to see if they are allowed to create tasks
*/

module.exports = function canCreateTask (req, res, next) {
  if(req.user[0].permissions.task_create)
    return next();
  else
    return res.send(403, { message: 'Not authorized'});
};
