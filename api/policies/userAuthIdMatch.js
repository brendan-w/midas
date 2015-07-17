/**
* Check that the email id matches the logged in userId
*/

module.exports = function userEmailIdMatch (req, res, next) {
  UserAuth.findOneById(req.route.params.id, function (err, auth) {
    if (err) { return res.send(400, { 'message': 'Error occurred looking up auth' }); }
    if (!auth) { return res.send(404); }
    if (auth.userId != req.user[0].id && !req.user[0].permissions.admin) {
      return res.send(403, { 'message': 'Not Authorized' });
    }
    next();
  });
};
