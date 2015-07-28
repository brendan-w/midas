var fs = require('fs');
var request = require('request');
var path = require('path');

//get the URL from the application config
var app = require('../../../config/application.js');
var app_url = "http://" + app.hostName + ":" + app.port + "/api";

module.exports = {
  init: function () {
    var j = request.jar();
    var r = request.defaults({ jar: j, followRedirect: false, timeout: 120000 });
    return r;
  },

  login: function (request, username, password, cb) {
    // logout first
    request.get({ url: app_url + '/auth/logout' }, function (err, response, body) {
      if (err) { return cb(err); }
      // then login
      request.post({ url: conf.url + '/auth/local',
                     form: { identifier: username, password: password, json: true },
                   }, function (err, response, body) {
        var getUser = function (cb) {
          request(app_url + '/user', function (err, response, body) {
            if (err) { return cb(err); }
            if (response.statusCode !== 200) {
              return cb('Error: Login unsuccessful. ' + body);
            }
            var b = JSON.parse(body);
            return cb(null, b);
          });
        };
        if (response.statusCode == 403) {
          // this could be because the user isn't registered; try to register
          // console.log('register user: '+username);
          request.post({ url: conf.url + '/auth/local/register',
                         form: { username: username, password: password, json: true },
                       }, function (err, response, body) {
            if (err) { return cb(err); }
            if (response.statusCode !== 200) {
              return cb('Error: Register unsuccessful. ' + body);
            }
            getUser(cb);
          });
        } else {
          getUser(cb);
        }
      });
    });
  },

  user_info: function (request, cb) {
    var r = request.get({
      url: app_url + '/user/'
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  user_put: function (request, id, user_attrs, cb) {
    var r = request.put({
      url: app_url + '/user/' + id,
      body: JSON.stringify(user_attrs)
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  user_disable: function (request, user, cb) {
    var r = request.get({
      url: app_url + '/user/disable/' + user.id,
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  file_create: function(request, filename, square, cb) {
    var r = request.post({
      url: app_url + '/file'
    }, function (err, response, body) {
      if (err) return cb(err, null);
      // posting a file doesn't actually return JSON, if successful
      if (body[0] != '{') {
        pre = '<textarea data-type="application/json">';
        post = '</textarea>';
        body = body.slice(pre.length, post.length * -1);
      }
      var b = JSON.parse(body);
      if (b.status == 500) return cb(new Error("500 Error from POST", b));
      return cb(null, b);
    });

    var form = r.form();
    if (square === true) {
      form.append('type', 'image_square');
    }
    form.append('file', fs.createReadStream(path.join(__dirname, filename)));
  },

  post: function (request, url, obj, cb) {
    request.post({ url: url,
                   body: JSON.stringify(obj)
                 }, function(err, response, body) {
      if (err || response.statusCode >= 400) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  put: function (request, url, obj, cb) {
    request.put({ url: url,
                   body: JSON.stringify(obj)
                 }, function(err, response, body) {
      if (err || response.statusCode >= 400) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  proj_create: function(request, proj, cb) {
    this.post(request, app_url + '/project', proj, cb);
  },

  projowner_create: function(request, proj, cb) {
    this.post(request, app_url + '/projectowner', proj, cb);
  },

  proj_put: function(request, proj, cb) {
    var r = request.put({
      url: app_url + '/project/'+proj.id,
      body: JSON.stringify(proj)
    }, function(err, response, body) {
      if (response.statusCode !== 200) {
        return cb(new Error("Project Update failed with response: "+ response.statusCode + " " + body));
      }

      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      cb(null, b);
    });
  },

  comment_create: function(request, comment, cb) {
    this.post(request, app_url + '/comment', comment, cb);
  },

  event_create: function(request, ev, cb) {
    this.post(request, app_url + '/event', ev, cb);
  },

  task_create: function(request, task, cb) {
    this.post(request, app_url + '/task', task, cb);
  },

  tag_find: function(request, name, type, cb) {
    var url = app_url + '/ac/tag?q=' + encodeURIComponent(name);
    if (type) {
      url = url + '&type=' + encodeURIComponent(type);
    }
    var r = request.get({
      url: url
    }, function(err, response, body) {
      if (err) { return cb(err, null); }
      var b = JSON.parse(body);
      for (var i in b) {
        if (b[i].name.toLowerCase() == name.toLowerCase()) {
          return cb(null, b[i]);
        }
      }
      cb(null, null);
    });
  },

  tag_add: function(request, tag, cb) {
    this.post(request, app_url + '/tagentity', tag, cb);
  },

  tag_create: function(request, tag, cb) {
    var model = (tag.projectId) ? 'project': 'user',
        modelId = tag[model + 'Id'],
        data = { tags: [tag.tagId] };
    this.put(request, app_url + '/' + model + '/' + modelId, data, cb);
  }

};
