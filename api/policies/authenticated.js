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
        req.user = user;
        // Make the user available throughout the frontend
        res.locals.user = req.user;
        // Support legacy req.user[0] format
        if (req.user) req.user[0] = req.user;
        return next();
      }

      // User is not allowed, send 403 message
      return res.send(403, {
        message: "You must login to perform this action."
      });
    })(req, res);
  }
};
