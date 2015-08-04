/**
* Only Admins should be able to UPDATE certain properties of the model.
* else, they should be scrubbed.
*/
module.exports = function userUpdate (req, res, next) {
  if ( !(req.user && req.user[0].permissions.admin) ) {
    delete req.body.permissions;
  }

  //the list of vets should always be scrubbed,
  //since editting this is done through the VetController
  delete req.body.vets;

  next();
};
