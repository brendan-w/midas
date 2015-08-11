/* jshint laxcomma:true */

var validator = require('validator');
var crypto    = require('crypto');

/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.register = function (req, res, next) {
  var name      = req.param('name')
    , username  = req.param('username')
    , password  = req.param('password')
    , type      = req.param('type')
    , tags      = req.param('tags')
    , languages = req.param('languages')
    , links     = req.param('links');

  if (!username) {
    req.flash('error', 'Error.Passport.Username.Missing');
    return next(new Error('No username was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  if (!type) {
    return next(new Error('No user type was given.'));
  }

  User.create({
    username :   username,
    name:        name,
    permissions: type,
    tags:        tags,
    languages:   languages,
    links:       links,
  }).populate('permissions').exec(function (err, user) {
    if (err) {
      if (err.code === 'E_VALIDATION') {
        req.flash('error', 'Error.Passport.User.Exists');
      }

      return next(err);
    }

    // Generating accessToken for API authentication
    var token = crypto.randomBytes(48).toString('base64');

    Passport.create({
      protocol    : 'local'
    , password    : password
    , user        : user.id
    , accessToken : token
    }, function (err, passport) {
      if (err) {
        if (err.code === 'E_VALIDATION') {
          req.flash('error', 'Error.Passport.Password.Invalid');
        }

        return user.destroy(function (destroyErr) {
          next(destroyErr || err);
        });
      }

      next(null, user);
    });
  });
};

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doesn't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function (req, res, next) {
  var user     = req.user
    , password = req.param('password');

  Passport.findOne({
    protocol : 'local'
  , user     : user.id
  }, function (err, passport) {
    if (err) {
      return next(err);
    }

    if (!passport) {
      Passport.create({
        protocol : 'local'
      , password : password
      , user     : user.id
      }, function (err, passport) {
        next(err, user);
      });
    }
    else {
      next(null, user);
    }
  });
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function (req, identifier, password, next) {
  var query = { username: identifier.toLowerCase() },
      maxAttempts = sails.config.auth.auth.local.passwordAttempts;

  User.findOne(query)
      .populate('permissions')
      .exec(function (err, user) {

    if (err) return next(err);

    if (!user) {
      req.flash('error', 'Error.Passport.Username.NotFound');
      return next(null, false);
    }

    if (maxAttempts > 0 && user.passwordAttempts >= maxAttempts) {
      return next('locked');
    }

    Passport.findOne({
      protocol : 'local'
    , user     : user.id
    }, function (err, passport) {
      if (passport) {
        passport.validatePassword(password, function (err, res) {
          if (err) {
            return next(err);
          }

          if (!res) {
            user.passwordAttempts++;
            user.save(function() {
              if (maxAttempts > 0 && user.passwordAttempts >= maxAttempts) {
                return next('locked');
              }
              req.flash('error', 'Error.Passport.Password.Wrong');
              return next(null, false);
            });
          } else {
            return next(null, user);
          }
        });
      }
      else {
        req.flash('error', 'Error.Passport.Password.NotSet');
        return next(null, false);
      }
    });
  });
};
