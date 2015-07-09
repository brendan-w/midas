/**
* Check the users permissions to see if they are allowed to create projects
*/

module.exports = function canCreateProject (req, res, next) {
  if(req.user[0].permissions.project_create)
    return next();
  else
    return res.send(403, { message: 'Not authorized'});
};
