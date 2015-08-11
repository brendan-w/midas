var async = require('async');
var assert = require('chai').assert;
var conf = require('./helpers/config');
var utils = require('./helpers/utils');
var request;
var task;
var attachment = {
    fileId: 1,
    taskId: 1,
    userId: 2
  };

describe('attachments:', function () {
  before(function (done) {
    request = utils.init();
    Task.create({ userId: 2, state: 'draft' }).exec(function(err, t) {
      if (err) return done(err);
      task = t;
      utils.logout(request, done);
    });
  });

  describe('not logged in:', function () {
    it('should fail', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 403);
        done(err);
      });
    });
  });

  describe('logged in:', function () {
    before(function (done) {
      utils.login(request, conf.defaultUser, done);
    });
    it('should fail', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 403);
        done(err);
      });
    });
  });

  describe('task creator, open task:', function () {
    before(function (done) {
      task.state = 'open';
      task.save(done);
    });
    it('should pass', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 200);
        done(err);
      });
    });
  });

  describe('volunteer, open task:', function () {
    before(function (done) {
      async.series([
        utils.logout.bind(this, request),
        utils.login.bind(this, request, conf.attachmentUser)
      ], done);
    });
    it('should fail', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 403);
        done(err);
      });
    });
  });

  describe('volunteer, assigned task:', function () {
    before(function (done) {
      Volunteer.create({ userId: 4, taskId: 1 }).exec(function(err, vol) {
        attachment.userId = 4;
        task.state = 'assigned';
        task.save(done);
      });
    });
    it('should pass', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 200);
        done(err);
      });
    });
  });

  describe('project non-owner:', function () {
    it('should fail', function(done) {
      delete attachment.taskId;
      attachment.projectId = 1;
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 403);
        done(err);
      });
    });
  });

  describe('project owner:', function () {
    before(function (done) {
      ProjectOwner.create({ projectId: 1, userId: 4 }, done);
    });
    it('should pass', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 200);
        done(err);
      });
    });
  });

  describe('admin:', function () {
    before(function (done) {
      async.series([
        utils.logout.bind(this, request),
        utils.login.bind(this, request, conf.adminUser)
      ], done);
    });
    it('should pass', function(done) {
      request.post({
        url: conf.url + '/attachment',
        json: attachment
      }, function(err, res, body) {
        assert.equal(res.statusCode, 200);
        done(err);
      });
    });
  });

  after(function(done) {
    Task.destroy(1).exec(done);
  });

});
