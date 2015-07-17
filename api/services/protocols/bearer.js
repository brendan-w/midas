var request = require('request'),
    async = require('async');

/*
 * Bearer Authentication Protocol
 *
 * Bearer Authentication is for authorizing API requests. Once
 * a user is created, a token is also generated for that user
 * in its passport. This token can be used to authenticate
 * API requests.
 *
 */

exports.authorize = function(token, done) {
  if (!token) { return done(null, false); }

  async.series([
    // Try to find user based on token
    function(cb) {
      Passport.findOne({ accessToken: token }).exec(function(err, passport) {
        if (err) return cb(err);
        if (!passport) return cb();
        User.findOne({ id: passport.user }).exec(function(err, user) {
          if (err) return cb(err);
          if (!user) return cb();
          return done(null, user);
        });
      });
    },
    // Try to find MyUSA user associated with email address
    function(cb) {
      var tokenAPI = 'https://alpha.my.usa.gov/api/v1/profile?access_token=' + token;
      request.get({ url: tokenAPI, json: true }, function(err, res, data) {
        if (err) return cb(err);
        if (!data || !data.email) return cb();
        User.findOne({ username: data.email }).exec(function(err, user) {
          if (err) return cb(err);
          if (!user) return cb();
          return done(null, user);
        });
      });
    }
    // No users match token
  ], function(err) {
    return done(err, false);
  });

};
