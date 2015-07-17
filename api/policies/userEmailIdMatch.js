/**
* Check that the email id matches the logged in userId
*/

module.exports = function userEmailIdMatch (req, res, next) {
  UserEmail.findOneById(req.route.params.id, function (err, email) {
    if (err) { return res.send(400, { 'message': 'Error occurred looking up email' }); }
    if (!email) { return res.send(404); }
    if (email.userId != req.user[0].id && !req.user[0].permissions.admin) {
      return res.send(403, { 'message': 'Not Authorized' });
    }
    next();
  });
};
