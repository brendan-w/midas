var _ = require('underscore');
var Backbone = require('backbone');


  var ProfileModel = Backbone.Model.extend({

    urlRoot: '/api/user',

    initialize: function () {
      this.initializeProfileSave();
      this.initializeProfileGet();
    },

    parse: function(res, options) {
      // Remove falsy values (db returns null instead of undefined)
      _(res).each(function(v, k, o) { if (!v) delete o[k]; });
      res.agency = _(res.tags).findWhere({ type: 'agency' });
      res.location = _(res.tags).findWhere({ type: 'location' });
      return res;
    },

    vetStateFor: function(projectId) {
      var vets = _.where(this.get('vets'), { project: projectId });

      if(vets.length == 0)
        return "none";
      else
        return vets[0].state;
    },

    //return true/false for if a user is vetted for a group
    isVettedFor: function(projectId) {

      var vets = this.get('vets');
      for(var i = 0; i < vets.length; i++)
      {
        if(vets[i].state   === 'accepted' &&
           vets[i].project === projectId)
          return true;
      }

      return false;
    },

    initializeProfileGet: function () {
      var self = this;

      this.listenTo(this, "profile:fetch", function (id) {
        self.remoteGet(id);
      });
    },

    remoteGet: function (id) {
      var self = this;
      if (id) {
          this.set({ id: id });
      }
      this.fetch({
        success: function (model, response, options) {
          self.trigger("profile:fetch:success", model);
        },
        error: function (model, response, options) {
          self.trigger("profile:fetch:error", model, response);
        }
      });
    },

    initializeProfileSave: function () {
      var _this = this;

      this.listenTo(this, "profile:updateWithPhotoId", function(file) {
        var _self = this;
        _this.save({
          photoId: file.id
        }, {
        success: function (data) {
          _this.trigger("profile:updatedPhoto", data);
        },
        error: function (data) {
          // an error occurred
        }
        });
      });

      this.listenTo(this, "profile:save", function (form) {
        var data = {
          firstname: form.firstname,
          lastname:  form.lastname,
          username:  form.username,
          title:     form.title,
          bio:       form.bio,
          tags:      form.tags,
          languages: form.languages,
          links:     form.links
        };
        _this.save(data, {
          success: function (data) {
            _this.trigger("profile:save:success", data);
          },
          error: function (data) {
            _this.trigger("profile:save:fail", data);
          }
        });
      });

			this.listenTo(this, "profile:removeAuth", function(service) {
				$.ajax({
					url: '/api/auth/disconnect/' + service,
					method: 'POST'
				}).done(function(data) {
					_this.fetch({
						success: function(model) {
							_this.trigger("profile:removeAuth:success", model, service);
						}
					});
				}).fail(function(data) {
					_this.trigger("profile:removeAuth:fail", data, service);
				});
			});

    }

  });

  module.exports = ProfileModel;
