/**
* Allow only admins.
*/
module.exports = function admin (req, res, next) {
  // Check the user is logged in and is an admin
  if (req.user && req.user[0].permissions.admin) { return next(); }
  return res.send(403, {message: "You must login as an admin to perform this action."});
};
