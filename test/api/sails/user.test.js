var assert = require('chai').assert;
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var async = require('async');
var _ = require('underscore');
var request;

describe('user:', function() {
  before(function (done) {
    request = utils.init();
    utils.logout(request, function (err) {
      if (err) { return done(err); }
      done();
    });
  });

  it('not logged in', function(done) {
    request(conf.url + '/user', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('deny profile data', function(done) {
    request(conf.url + '/user/profile', function(err, response, body) {
      if (err) { return done(err); }
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('deny export', function (done) {
    request.get({
      url: conf.url + '/user/export'
    }, function (err, response, body) {
      // Not logged in users should get a 403
      assert.equal(response.statusCode, 403);
      done(err);
    });
  });
  it('register with domain block (failure)', function (done) {
    sails.config.validateDomains = true;
    request.post({ url: conf.url + '/auth/local',
                   form: {
                     username: conf.DomainBlockedUser.username,
                     password: conf.DomainBlockedUser.password,
                     json: true
                   },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 403);
      request.post({ url: conf.url + '/auth/local/register',
                     form: { name: conf.DomainBlockedUser.name, username: conf.DomainBlockedUser.username, password: conf.DomainBlockedUser.password, json: true },
                   }, function (err, response, body) {
        if (err) { return done(err); }
        // Should be Blocked
        assert.equal(response.statusCode, 403);
        var b = JSON.parse(body);
        assert.equal(b.message, 'You need to have a .gov or .mil email address.');
        done();
      });
    });
  });
  it('register with domain block (success)', function (done) {
    sails.config.validateDomains = true;
    request.post({ url: conf.url + '/auth/local',
                   form: {
                     username: conf.DomainAllowedUser.username,
                     password: conf.DomainAllowedUser.password,
                     json: true
                   },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 403);
      request.post({ url: conf.url + '/auth/local/register',
                     form: { name: conf.DomainAllowedUser.name, username: conf.DomainAllowedUser.username, password: conf.DomainAllowedUser.password, json: true },
                   }, function (err, response, body) {
        if (err) { return done(err); }
        // Should be allowed
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.equal(b.username, conf.DomainAllowedUser.username);
        assert.equal(b.name, conf.DomainAllowedUser.name);
        // reset domain block to false
        sails.config.validateDomains = false;
        // logout at end of test
        request(conf.url + '/auth/logout', function (err, response, body) {
          if (err) { return done(err); }
          done();
        });

      });
    });
  });
  it('register without domain block', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password, json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      assert.equal(response.statusCode, 403);
      request.post({ url: conf.url + '/auth/local/register',
                     form: { name: conf.testUser.name, username: conf.testUser.username, password: conf.testUser.password, json: true },
                   }, function (err, response, body) {
        if (err) { return done(err); }
        // Successful login or creation should be a 200 json object
        assert.equal(response.statusCode, 200);
        var b = JSON.parse(body);
        assert.equal(b.username, conf.testUser.username);
        assert.equal(b.name, conf.testUser.name);
        request(conf.url + '/auth/logout', function (err, response, body) {
          if (err) { return done(err); }
          done();
        });
      });
    });
  });
  it('register with location required (success)', function (done) {
    sails.config.requireLocation = true;

    var registrationInfo = {
      name: conf.LocationRequiredUser.name,
      username: conf.LocationRequiredUser.username,
      password: conf.LocationRequiredUser.password,
      json: true
    };

    request.post({ url: conf.url + '/auth/local', form: registrationInfo },
      function (err, response, body) {
        if (err) return done(err);
        assert.equal(response.statusCode, 403);
        registrationInfo.location = conf.LocationRequiredUser.location;
        //console.log('registrationInfo', registrationInfo);
        request.post({ url: conf.url + '/auth/local/register', form: registrationInfo, json: true },
          function (err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 200);
            assert.equal(body.username, conf.LocationRequiredUser.username);
            assert.equal(body.name, conf.LocationRequiredUser.name);
            // make sure to log out
            request(conf.url + '/auth/logout', function (err, response, body) {
              if (err) return done(err);
              sails.config.requireLocation = false;
              done();
            });
        });
      }
    );
  });
  it('register with location required (failure)', function (done) {
    sails.config.requireLocation = true;

    var registrationInfo = {
      name: conf.LocationRequiredUser.name,
      username: conf.LocationRequiredUser.username,
      password: conf.LocationRequiredUser.password,
      json: true
    };

    request.post({ url: conf.url + '/auth/local', form: registrationInfo },
      function (err, response, body) {
        if (err) return done(err);
        assert.equal(response.statusCode, 403);
        request.post({ url: conf.url + '/auth/local/register', form: registrationInfo },
          function (err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 403);

            // make sure to log out
            request(conf.url + '/auth/logout', function (err, response, body) {
              if (err) return done(err);
              sails.config.requireLocation = false;
              done();
            });
        });
    });
  });
  it('register with agency required (success)', function (done) {
    sails.config.requireAgency = true;

    var registrationInfo = {
      name: conf.AgencyRequiredUser.name,
      username: conf.AgencyRequiredUser.username,
      password: conf.AgencyRequiredUser.password,
      json: true
    };

    request.post({ url: conf.url + '/auth/local', form: registrationInfo },
      function (err, response, body) {
        if (err) return done(err);
        assert.equal(response.statusCode, 403);
        registrationInfo.agency = conf.AgencyRequiredUser.agency;
        request.post({ url: conf.url + '/auth/local/register', form: registrationInfo, json: true },
          function (err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 200);
            assert.equal(body.username, conf.AgencyRequiredUser.username);
            assert.equal(body.name, conf.AgencyRequiredUser.name);
            // make sure to log out
            request(conf.url + '/auth/logout', function (err, response, body) {
              if (err) return done(err);
              sails.config.requireAgency = false;
              done();
            });
        });
      }
    );
  });
  it('register with agency required (failure)', function (done) {
    sails.config.requireAgency = true;

    var registrationInfo = {
      name: conf.AgencyRequiredUser.name,
      username: conf.AgencyRequiredUser.username,
      password: conf.AgencyRequiredUser.password,
      json: true
    };

    request.post({ url: conf.url + '/auth/local', form: registrationInfo },
      function (err, response, body) {
        if (err) return done(err);
        assert.equal(response.statusCode, 403);
        request.post({ url: conf.url + '/auth/local/register', form: registrationInfo },
          function (err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 403);

            // make sure to log out
            request(conf.url + '/auth/logout', function (err, response, body) {
              if (err) return done(err);
              sails.config.requireAgency = false;
              done();
            });
        });
    });
  });
  it('create duplicate user logged in', function (done) {
    request.post({
      url: conf.url + '/auth/local/register',
      form: {
        name: conf.testUser.name,
        username: conf.testUser.username,
        password: conf.testUser.password,
        json: true
      }
    }, function (err, response, body) {
      // Should be denied because the account already exists
      assert.equal(response.statusCode, 403);
      done();
    });
  });
  it('create duplicate user logged out', function (done) {
    request(conf.url + '/auth/logout', function (err, response, body) {
      if (err) { return done(err); }
      // it redirects for browser
      assert(response.statusCode === 302);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        next();
      });
    });
    function next() {
      request.post({
        url: conf.url + '/auth/local/register',
        form: {
          name: conf.testUser.name,
          username: conf.testUser.username,
          password: conf.testUser.password,
          json: true
        }
      }, function (err, response, body) {
        if (err) { return done(err); }
        // Should be denied because the account already exists
        assert.equal(response.statusCode, 403);
        done();
      });
    }
  });
  it('logout', function (done) {
    request(conf.url + '/auth/logout', function (err, response, body) {
      if (err) { return done(err); }
      // it redirects for browser
      assert(response.statusCode === 302);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert(response.statusCode === 403);
        done();
      });
    });
  });
  it('login bad password', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { username: conf.testUser.username, password: conf.testUser.password + 'baz', json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Unsuccessful logins should result in a 403 NOT AUTHORIZED http error
      assert.equal(response.statusCode, 403);
      // Check if the user is logged in
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 403
        assert.equal(response.statusCode, 403);
        done();
      });
    });
  });
  it('login success', function (done) {
    request.post({ url: conf.url + '/auth/local',
                   form: { identifier: conf.testUser.username, password: conf.testUser.password, json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 200 unauthorized
      assert.equal(response.statusCode, 200);
      // Check if the user is logged in
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, conf.testUser.username);
        done();
      });
    });
  });
  it('show profile data', function(done) {
    request(conf.url + '/user/profile', function(err, response, body) {
      if (err) { return done(err); }
      var obj = JSON.parse(body);
      // Authorized response
      assert.equal(response.statusCode, 200);
      // Has user profiles
      assert.isAbove(obj.length, 0);
      // Can only see own email address
      var emails = _(obj).chain()
            .map(function(o) { return o.username; })
            .compact()
            .value();
      assert.equal(emails.length, 1);
      request(conf.url + '/user', function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emails[0]);
        done();
      });
    });
  });
  it('change email', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      var emailBefore = obj.username,
          userBefore = obj.id,
          emailAfter = emailBefore.replace('@', '+test@');
      request.put({
        url: conf.url + '/user/' + userBefore,
        form: { username: emailAfter },
      }, function(err, response, body) {
        if (err) { return done(err); }
        // Logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emailAfter);
        done();
      });
    });
  });
  it('verify changed username', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      assert.equal(obj.username, conf.testUser.username.replace('@', '+test@'));
      done();
    });
  });
  it('change back email', function(done) {
    // Check if the user is logged in
    request(conf.url + '/user', function (err, response, body) {
      if (err) { return done(err); }
      // Logged in users should get a 200 with the user object
      assert.equal(response.statusCode, 200);
      var obj = JSON.parse(body);
      var emailBefore = obj.username,
          userBefore = obj.id,
          emailAfter = emailBefore.replace('+test@', '@');
      request.put({
        url: conf.url + '/user/' + userBefore,
        form: { username: emailAfter },
      }, function(err, response, body) {
        if (err) { return done(err); }
        // Logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emailAfter);
        done();
      });
    });
  });
  it('reset password', function (done) {
    request.post({ url: conf.url + '/user/resetPassword',
                   form: { password: conf.testUser.password + "aBc", json: true },
                 }, function (err, response, body) {
      if (err) { return done(err); }
      // Successful login or creation should result in a 200 unauthorized
      assert.equal(response.statusCode, 200);
      // check that the body is true
      var b = JSON.parse(response.body);
      assert.isTrue(b);
      conf.testUser.password += "aBc";
      // Check the new password works
      request(conf.url + '/auth/logout', function (err, response, body) {
        if (err) { return done(err); }
        request.post({ url: conf.url + '/auth/local',
                       form: { identifier: conf.testUser.username, password: conf.testUser.password, json: true },
                     }, function (err, response, body) {
          if (err) { return done(err); }
          // Successful login or creation should result in a 200 unauthorized
          assert.equal(response.statusCode, 200);
          // logout at end of test
          request(conf.url + '/auth/logout', function (err, response, body) {
            if (err) { return done(err); }
            done();
          });
        });
      });
    });
  });
  it('read api with access_token', function(done) {
    // Tests the API with a bearer access_token,
    // reading from the profile and user endpoints
    var token = '?access_token=testCode';
    request(conf.url + '/user/profile' + token, function(err, response, body) {
      if (err) { return done(err); }
      var obj = JSON.parse(body);
      // Authorized response
      assert.equal(response.statusCode, 200);
      // Has user profiles
      assert.isAbove(obj.length, 0);
      // Can only see own email address
      var emails = _(obj).chain()
            .map(function(o) { return o.username; })
            .compact()
            .value();
      assert.equal(emails.length, 1);
      request(conf.url + '/user' + token, function (err, response, body) {
        if (err) { return done(err); }
        // Not logged in users should get a 200 with the user object
        assert.equal(response.statusCode, 200);
        var obj = JSON.parse(body);
        assert.equal(obj.username, emails[0]);
        done();
      });
    });
  });


  it('lockout user', function (done) {
    var count = 0;
    async.whilst(
      function () { return count < 6; },
      function (callback) {
        count++;
        var extra = '';
        if (count < 6) {
          extra = 'baz';
        }
        request.post({ url: conf.url + '/auth/local',
                       form: { identifier: conf.testUser.username, password: conf.testUser.password + extra, json: true },
                     }, function (err, response, body) {
          if (err) { return callback(err); }
          // Unsuccessful login or creation should result in a 403
          assert.equal(response.statusCode, 403);
          var b = JSON.parse(response.body);
          assert.isDefined(b.message);
          if (count == 5) {
            // still the wrong password but should be locked out
            assert.include(b.message, 'Your account has been locked');
          }
          if (count == 6) {
            // correct password but locked out
            assert.include(b.message, 'Your account has been locked');
          }
          callback(err);
        });
      },
      function (err) {
        done(err);
      }
    );

  });
});
