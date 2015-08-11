var config = require('./config');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var casper_chai = require('casper-chai');
chai.use(casper_chai);

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

describe('Task actions', function() {

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
      casper.waitForSelector('a.add-opportunity');
    });

  });

  it('should create new task', function() {

    // Click +opportunity
    casper.then(function() {
      casper.click('.add-opportunity');
    });

    // Fill out the form
    casper.then(function() {
      casper.fillSelectors('#task-form', {
        '#task-title': config.task.title,
        '#task-description': config.task.description,
        '#anywhere': true
      });
    }, false);

    // Click "Create"
    casper.then(function() {
      casper.click('#create-button');
      casper.waitForSelector('.edit-task-section');
    });

    // Verify new task
    casper.then(function() {
      var title = casper.fetchText('.edit-task-section h1'),
          description = casper.fetchText('.edit-task-section .task-show-description').trim(),
          people = casper.fetchText('#task-people-empty+li').trim();
      assert.equal(config.task.title, title);
      assert.equal(config.task.description, description);
    });
  });

  it('should edit task', function() {

    // Click the edit task button
    casper.then(function() {
      casper.click('#task-edit');
      casper.waitForSelector('#task-edit-form');
    });

    // Change the title and description
    casper.then(function() {
      casper.fillSelectors('#task-edit-form', {
        '#task-title': config.task.titleChange,
        '#task-description': config.task.descriptionChange
      }, false);
      casper.click('#task-edit-form input[type="submit"]');
      casper.waitUntilVisible('.li-task-edit');
    });

    // Verify updated task
    casper.then(function() {
      var title = casper.fetchText('.edit-task-section h1'),
          description = casper.fetchText('.edit-task-section .task-show-description').trim(),
          people = casper.fetchText('#task-people-empty+li').trim();
      assert.equal(config.task.titleChange, title);
      assert.equal(config.task.descriptionChange, description);
    });

  });

  it('should change opportunity state', function() {

    // Click "Change Opportunity State"
    casper.then(function() {
      var task = casper.getCurrentUrl().split('/').pop();
      casper.click('#task-close');
      casper.fill('#modal-form', {
        'opportunityState': 'completed'
      });
      casper.click('#submit');
      casper.wait(1000 * 2); // Wait for AJAX POST to complete
    });

    // Verify state changed
    casper.then(function() {
      var task = casper.getCurrentUrl().split('/').pop(),
          data = casper.evaluate(function(url) {
            return JSON.parse(__utils__.sendAJAX(url, 'GET', null, false));
          }, {
            url: system.env.TEST_ROOT + '/api/task/' + task
          });
      assert.equal(data.state, 'completed');
    });
  });

});
