/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

module.exports.passport = {
  local: {
    strategy: require('passport-local').Strategy
  },

  bearer: {
    strategy: require('passport-http-bearer').Strategy
  },

  myusa: {
    strategy: require('passport-myusa').Strategy,
    protocol: 'oauth2',
    callback : process.env.MYUSA_CALLBACK_URL || '/api/auth/callback/myusa',
    options: {
      clientID    : process.env.MYUSA_CLIENT_ID  || 'CLIENT_ID',
      clientSecret: process.env.MYUSA_CLIENT_SECRET || 'CLIENT_SECRET',
      // Initially use alpha.my.usa.gov until app approved for production
      authorizationURL: 'https://alpha.my.usa.gov/oauth/authorize',
      tokenURL: 'https://alpha.my.usa.gov/oauth/token',
      profileURL: 'https://alpha.my.usa.gov/api/v1/profile',
      scope: ["profile.email", "profile.first_name", "profile.last_name"]
    }
  },

  linkedin: {
    strategy: require('passport-linkedin').Strategy,
    protocol: 'oauth',
    callback : process.env.LINKEDIN_CALLBACK_URL || '/api/auth/callback/linkedin',
    options: {
      consumerKey   : process.env.LINKEDIN_CLIENT_ID  || 'CLIENT_ID',
      consumerSecret: process.env.LINKEDIN_CLIENT_SECRET || 'CLIENT_SECRET',
      scope: ["r_basicprofile", "r_fullprofile", "r_emailaddress", "r_network"]
    },
    passReqToCallback: true,
    profileFields: [
      'id',
      'first-name',
      'last-name',
      'formatted-name',
      'email-address',
      'headline',
      'picture-url',
      'picture-urls::(original)',
      'location:(name)',
      'summary',
      'skills',
      'interests',
      'three-current-positions'
    ]
  }

};
