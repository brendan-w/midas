/*
   Global before() and after() launcher for Sails application
   to run tests like Controller and Models test
*/
var fs = require('fs');
var helperConfig = require('./api/sails/helpers/config');

var sails;
var err;

process.env.NODE_ENV = (process.argv.indexOf('--development') >= 0) ? 'development' : 'test';

before(function(done) {
  console.log('lifting sails: env='+process.env.NODE_ENV );

  var config = {
    // turn down the log level so we can view the test results
    log: {
      level: 'error'
    },
    validateDomains: false,
    requireAgency: false,
    requireLocation: false,
    emailProtocol: '',
    hooks: {
      grunt: false,
      sockets: false,
      pubsub: false,
      csrf: false
    }
  };

  if (process.env.NODE_ENV == 'test') {
    // remove the database directories
    if (fs.existsSync('./.tmp/disk.db')) {
      fs.unlinkSync('./.tmp/disk.db');
    }
    config.adapters = {
      'default': 'disk'
    };
  }
  // Lift Sails and store the app reference
  require('sails').lift(config, function(e, s) {
    sails = s;
    err = e;
    // export properties for upcoming tests with supertest.js
    sails.localAppURL = localAppURL = ( sails.usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';
    // save reference for teardown function

    if (process.env.NODE_ENV === 'test') {

      //Add temp userauth
      sails.models.passport.create({
        user: 1,
        provider: 'test',
        protocol: 'test',
        accessToken: 'testCode'
      }, function(err, model) {
        if (err) return done(err);

        var adminUser = helperConfig.adminUser;

        // Add an admin user
        sails.models.user.create({
          name: adminUser.name,
          username: adminUser.username,
          isAdmin: true
        }, function(err, user) {
          if (err) return done(err);
          sails.models.passport.create({
            protocol: 'local',
            password: adminUser.password,
            user: user.id
          }, function(err) {
            if (err) return done(err);
            done();
          });
        });
      });

    } else {
      done();
    }

  });


});

// After Function
after(function(done) {
  console.log('\nLowering sails');
  sails.lower(done);
});
