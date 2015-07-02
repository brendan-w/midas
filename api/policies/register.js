/**
* Checks that a user is allowed to register with their requested account type (permissions)
*/
module.exports = function admin (req, res, next) {
  // Check the user is logged in and is an admin
  var type = req.param("type");
  if (!type) { return res.send(400, { message: 'Please specify an account type' }); }

  //lookup the permissions (account type) that this user is requesting
  Permissions.findOneByName(type, function(err, p) {
    if (err || !p || !p.registration_option) {
      return res.send(400, { message: 'Invalid account type' });
    } else {
      return next();
    }
  });
};
