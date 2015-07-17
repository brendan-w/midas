/**
* Add userId into params for knowing who created them.
*/
var _ = require('underscore');

module.exports = function addUserId (req, res, next) {
  if (req.user) {
    // Check if this request is sending an object in the body
    if (!_.isEmpty(req.body)) { req.body.userId = req.user[0].id; }
    // If not, add the logged in user to the parameters
    else {req.params.userId = req.user.id; }
  }
  next();
};
