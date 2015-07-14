/**
* Only Admins should be able to UPDATE the permissions property of the model.
* All other references to isAdmin should be scrubbed.
*/
module.exports = function scrubPermissions (req, res, next) {
  if ( !(req.user && req.user[0].permissions.admin) ) {
    delete req.body.permissions;
  }
  next();
};
