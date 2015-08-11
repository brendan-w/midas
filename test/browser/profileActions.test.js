var config = require('./config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var casper_chai = require('casper-chai');
chai.use(casper_chai);

var buildSettings = require('../../assets/js/backbone/config/login.json');

// access environment vars
var system = require('system');

/**
 *
 * User action tests
 *
 */

before(function() {
  casper.start(system.env.TEST_ROOT + '/tasks', function afterStart() {
    this.options = {
      waitTimeout: 1000 * 15
    };
    this.on('remote.message', function(message) {
      this.log('browser console.log ==> ' + message);
    });
  }).viewport(1000,1000).userAgent('Mozilla/5.0');
});

describe('Profile actions', function() {

  it('should create a new account', function() {
    var submitButton = '#registration-form button[type="submit"]';

    // Click the login button
    casper.then(function(){
      casper.click('.login');
      casper.waitForSelector('#login-register');
    });

    // Click the "sign up now" button
    casper.then(function() {
      casper.click('#login-register');
      casper.waitForSelector('#registration-form');
    });

    // Fill out the registration form
    casper.then(function() {
      var registration = {
        '#rname': config.user.name,
        '#rusername': config.user.username,
        '#rpassword': config.user.password,
        '#rpassword-confirm': config.user.password
      };

      // If the build settings enable agency or location include thos
      if (buildSettings.agency.enabled) registration['#ragency'] = config.user.agency;
      if (buildSettings.location.enabled) registration['#rlocation'] = config.user.location;
      casper.fillSelectors('#registration-form', registration, false);
      casper.waitForSelector(submitButton);
    });

    // Click the "register" button
    casper.then(function() {
      casper.click(submitButton);
      casper.waitForSelector('.profile.dropdown');
    });

    // Verify that account was created and user is logged in
    casper.then(function() {
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.equal(username, config.user.username);
    });

  });

  it('should edit profile', function() {

    // Click view profile
    casper.then(function() {
      casper.click('.nav-link[id="profileLink"]');
      casper.waitForSelector('.link-backbone');
    });

    // Click edit profile
    casper.then(function() {
      casper.click('.link-backbone');
      casper.waitForSelector('#profile-form');
    });

    // Fill form
    casper.then(function() {
      casper.fillSelectors('#profile-form', {
        '#title': config.user.title,
        '#bio': config.user.bio
      }, false);
      casper.click('#submit');
      casper.waitForSelector('.profile-jobtitle');
    });

    // Verify title and bio set correctly
    casper.then(function() {
      var bioUI = casper.fetchText('.profile-bio'),
          titleUI = casper.fetchText('.profile-jobtitle .box-icon-text'),
          data = casper.evaluate(function() {
            return window.cache.currentUser;
          });
      assert.equal(config.user.bio, bioUI.trim());
      assert.equal(config.user.bio, data.bio.trim());
      assert.equal(config.user.title, titleUI.trim());
      assert.equal(config.user.title, data.title.trim());
    });
  });

  it('should log out', function() {

    // Click the log out button
    casper.then(function() {
      casper.click('a.logout');
      casper.waitForSelector('a.login');
    });

    // Verify that the user is not logged in
    casper.then(function() {
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.isNull(username);
    });

  });

  it('should log into account', function() {
    var submitButton = '#login-password-form button[type="submit"]';

    // Click the login button
    casper.then(function(){
      casper.click('.login');
      casper.waitForSelector('#login-register');
    });

    // Fill out the login form
    casper.then(function() {
      casper.fillSelectors('#login-password-form', {
        '#username': config.user.username,
        '#password': config.user.password
      }, false);
      casper.waitForSelector(submitButton);
    });

    // Click the "sign in" button
    casper.then(function() {
      casper.click(submitButton);
      casper.waitForSelector('.profile.dropdown');
    });

    // Verify that account was created and user is logged in
    casper.then(function(){
      var username = casper.evaluate(function() {
        return window.cache.currentUser.username;
      });
      assert.equal(username, config.user.username);
    });

    // Go back to task page
    casper.then(function() {
      casper.click('.nav-link[href="/tasks"]');
      casper.waitForSelector('a.logout');
    });

    // Go log out
    casper.then(function() {
      casper.click('a.logout');
      casper.waitForSelector('a.login');
    });
  });

  it('should log in from task page', function() {
    var submitButton = '#login-password-form button[type="submit"]';

    // Click task title
    casper.then(function() {
      casper.click('.task-box a');
      casper.waitForSelector('#volunteer');
    });

    // Click volunteer button
    casper.then(function() {
      casper.click('#volunteer');
      casper.waitForSelector('#login-register');
    });

    // Fill out the login form
    casper.then(function() {
      casper.fillSelectors('#login-password-form', {
        '#username': config.user.username,
        '#password': config.user.password
      }, false);
      casper.waitForSelector(submitButton);
    });

    // Click the "sign in" button
    casper.then(function() {
      casper.click(submitButton);
      casper.waitForSelector('#submit');
    });

  });

  it('should volunteer after logging in', function() {

    // Click "I agree" to volunteer
    casper.then(function() {
      casper.click('#submit');
      casper.waitUntilVisible('.volunteer-true');
    });

    // Get the task data from the API and confirm volunteer is set
    casper.then(function() {
      var user = casper.evaluate(function() {
            return window.cache.currentUser.id;
          }),
          task = casper.getCurrentUrl().split('/').pop(),
          data = casper.evaluate(function(url, userId) {
            return JSON.parse(__utils__.sendAJAX(url, 'GET', null, false));
          }, {
            url: system.env.TEST_ROOT + '/api/task/' + task,
            userId: user
          });
      assert(data.volunteers[0].userId, user);
    });

  });

});
