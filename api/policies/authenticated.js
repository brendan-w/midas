var passport = require('passport');

/**
* Allow any authenticated user.
*/
module.exports = function authenticated (req, res, next) {

  // User is allowed, proceed to controller for all other operations
  if (req.isAuthenticated()) {
    return next();
  } else {

    // Check for API token
    passport.authenticate('bearer', { session: false }, function(err, user, info) {
      if (err) { return next(err); }

      // If logged in, set the user
      if (user) {
        req.user = [user];
        return next();
      }

      // User is not allowed, send 403 message
      return res.send(403, {
        message: "You must login to perform this action."
      });
    })(req, res);
  }
};
