/**
* Require an :id parameter to be specified.
*/

module.exports = function requireId (req, res, next) {
  if (!req.route.params.id) {
    return res.send(400, { message: ':id required.'});
  }
  next();
};
