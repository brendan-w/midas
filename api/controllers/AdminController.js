/**
 * AdminController
 *
 * @module      :: Controller
 * @description	:: Administrative functions only available to admin users
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var async = require('async');

module.exports = {

  /**
   * List users that match a certain filter, or all users if no filter
   * @param page the current page number
   * @param limit the maximum number of results per page to return
   * @param q the filter to apply to the search (filters by name)
   */
  users: function (req, res) {
    var page = parseInt(req.param('page', 1));
    var limit = req.param('limit', 25);
    var query = req.param('q');
    var where = {};

    if (query) {
      // search by both name and username
      where = {
        or: [
          { like: { name: '%' + query + '%' }},
          { like: { username: '%' + query + '%' }}
        ]
      };
    }

    var addUserMetrics = function(user, callback) {
      // check for lockouts
      user.locked = false;
      if (user.passwordAttempts >= sails.config.auth.auth.local.passwordAttempts) {
        user.locked = true;
      }
      async.parallel([
        // add project counts
        function(done) {
          // add created projects
          user.projectsCreatedOpen = 0;
          user.projectsCreatedClosed = 0;
          ProjectOwner.find().where({id:user.id}).exec(function(err, owners) {
            if (err) { done('Failed to retrieve ProjectOwners ' +  err);}
            if (owners.length !== 0) {
              var projIds = [];
              for (var j in owners) {
                projIds.push(owners[j].projectId);
              }
              Project.find().where({id: projIds}).exec(function(err, projects) {
                if (err) { done('Failed to retrieve projects ' +  err);}
                async.each(projects, function(project, cb) {
                  if (project.state === "open") {
                    user.projectsCreatedOpen++;
                    cb();
                  }
                  else {
                    user.projectsCreatedClosed++;
                    cb();
                  }
                }, function(err) {
                  done(null);
                });
              });
            } else {
              done(null);
            }
          });
        },
        // add task counts
        function(done) {
          user.tasksCreatedOpen = 0;
          user.tasksCreatedAssigned = 0;
          user.tasksCreatedCompleted = 0;
          user.tasksCreatedArchived = 0;
          async.parallel([
            function(cb) {
              Task.countByState("open").where({userId:user.id}).exec(function(err, openCount) {
                user.tasksCreatedOpen = openCount;
                cb();
              });
            },
            function(cb) {
              Task.countByState("assigned").where({userId:user.id}).exec(function(err, assignedCount) {
                user.tasksCreatedAssigned = assignedCount;
                cb();
              });
            },
            function(cb) {
              Task.countByState("completed").where({userId:user.id}).exec(function(err, completedCount) {
                user.tasksCreatedCompleted = completedCount;
                cb();
              });
            },
            function(cb) {
              Task.countByState("archived").where({userId:user.id}).exec(function(err, archivedCount) {
                user.tasksCreatedArchived = archivedCount;
                cb();
              });
            }], function(err) {
              done(null);
            });
        },
        // add volunteer counts
        function(done) {
          user.volCountOpen = 0;
          user.volCountAssigned= 0;
          user.volCountCompleted = 0;
          user.volCountArchived = 0;
          Volunteer.find().where({userId:user.id}).exec(function(err, volunteers) {
            if (err) { done('Failed to retrieve volunteers ' +  err);}
            if (volunteers.length !== 0) {
              var taskIds = [];
              for (var i in volunteers) {
                taskIds.push(volunteers[i].taskId);
              }
              Task.find().where({id: taskIds}).exec(function(err, tasks) {
                if (err) { done('Failed to retrieve tasks for volunteers ' +  err);}
                async.each(tasks, function(task, cb) {
                  if (task.state === "open") {
                    user.volCountOpen++;
                    cb();
                  }
                  else if (task.state === "assigned") {
                    user.volCountAssigned++;
                    cb();
                  }
                  else if (task.state === "completed") {
                    user.volCountCompleted++;
                    cb();
                  }
                  else if (task.state === "archived") {
                    user.volCountArchived++;
                    cb();
                  }
                  else {
                    cb();
                  }
                }, function(err) {
                  done(null);
                });
              });
            } else {
              done(null);
            }
          });
        }], function(err) {
          callback(null);
        });
    };

    // find users that meet this criteria
    User.find()
    .where(where)
    .sort({ createdAt: 'desc' })
    .paginate({ page: page, limit: limit})
    .exec(function (err, users) {
      if (err) { return res.send(400, { message: 'Error looking up users', err: err}); }
      // count the total number of users
      User.count(function (err, count) {
        if (err) { return res.send(400, { message: 'Error counting users', err: err}); }
        async.each(users, addUserMetrics, function(err) {
          if (err) { res.send(400, { message: 'Error retrieving metrics for users.', err: err}); }
          // return a paginated object
          return res.send({
            page: page,
            limit: Math.min(users.length, limit),
            count: count,
            users: users,
            q: query
          });
        });
      });
    });
  },

  /**
   * Retrieve metrics not tied to a particular user
   * eg: /api/admin/metrics
   */
  metrics: function (req, res) {
    var metrics = {
      users: {
        count: 0,
        withTasks: 0
      },
      tasks: {
        count: 0,
        draft: 0,
        open: 0,
        assigned: 0,
        completed: 0,
        archived: 0
      },
      projects: {
        count: 0
      }
    };

    User.count({ disabled: false }).exec(function(err, userCount) {
      if (err) { return res.send(400, { message: 'An error occurred looking up user metrics.', error: err }); }
      metrics.users.count = userCount;
      Task.find().sort('userId').exec(function(err, tasks) {
        if (err) { return res.send(400, { message: 'An error occurred looking up task metrics.', error: err }); }
        metrics.users.withTasks = _(tasks).pluck('userId').uniq().value().length;
        metrics.tasks.count = tasks.length;
        for(var i = 0; i < metrics.tasks.count; i++) {
          if (tasks[i].state === "open") {
            metrics.tasks.open++;
          } else if (tasks[i].state === "assigned") {
            metrics.tasks.assigned++;
          } else if (tasks[i].state === "completed") {
            metrics.tasks.completed++;
          } else if (tasks[i].state === "archived") {
            metrics.tasks.archived++;
          } else if (tasks[i].state === "draft") {
            metrics.tasks.draft++;
          }
        }
        Volunteer.find().sort('taskId').exec(function(err, vols) {
          if (err) { return res.send(400, { message: 'An error occurred looking up task metrics.', error: err }); }
          var lastId = -1;
          for (var j = 0; j < vols.length; j++) {
            if (vols[j].taskId !== lastId) {
              metrics.tasks.withVolunteers++;
              lastId = vols[j].taskId;
            }
          }
          Project.count().exec(function(err, projectCount) {
            if (err) { return res.send(400, { message: 'An error occurred looking up project metrics.', error: err }); }
            metrics.projects.count = projectCount;
            return res.send(metrics);
          });
        });
      });
    });
  },

  /**
   * Task metrics API
   * Provides data for the task metrics section of the admin
   * dashboard. At some point, it may be consolidated
   * with the above endpoint.
   */
  taskMetrics: function(req, res) {
    var getFY = function(input) {
          if (!input) return undefined;
          var date = new Date(input);
          return new Date(date.setMonth(date.getMonth() + 3)).getFullYear();
        },
        currentFY = getFY(new Date()),
        fiscalYears = _.range(2014, currentFY + 1),
        output = {
          tasks: {},
          volunteers: {},
          agencies: {},
          fiscalYears: fiscalYears
        };

    async.parallel([
      function(done) {
        Task.find({}).exec(function(err, tasks) {
          if (err) return done('task');

          var groups = {
                carryOver: {},
                published: _.countBy(tasks, function(task) {
                  return getFY(task.publishedAt);
                }),
                completed: _.countBy(tasks, function(task) {
                  return getFY(task.completedAt);
                })
              };

          // Evaluate whether a task was started and remained open in a previous FY
          _.each(tasks, function(task) {
            fiscalYears.forEach(function(fy) {
              var openedBeforeFY = getFY(task.publishedAt) < fy,
                  openAfterFY = task.state !== 'archived' &&
                    (!task.completedAt || getFY(task.completedAt) > fy);
              groups.carryOver[fy] = groups.carryOver[fy] || 0;
              if (openedBeforeFY && openAfterFY) groups.carryOver[fy] += 1;
            });
          });

          output.tasks = groups;
          done();
        });
      },
      function(done) {
        Volunteer.find({}).exec(function(err, volunteers) {
          if (err) return done('volunteer');

          // Group volunteers by created FY
          output.volunteers = _.groupBy(volunteers, function(volunteer) {
            return getFY(volunteer.createdAt);
          });

          // Get volunteer users and tags to count agencies
          User.find({ id: _.pluck(volunteers, 'userId') })
            .populate('tags', { type: 'agency' })
            .exec(function(err, users) {
              if (err) return done('volunteer');

              // Get unique agencies with volunteers
              output.agencies = _.reduce(output.volunteers, function(o, vols, fy) {

                // Return agency (first tag) for matching user
                o[fy] = _(vols).map(function(vol) {
                  return (_.findWhere(users, { id: vol.userId }).tags[0] || {}).id;
                }).compact().uniq().value().length;

                return o;

              }, {});

              // Count volunteers
              output.volunteers = _.reduce(output.volunteers, function(o, vols, fy) {
                o[fy] = vols.length;
                return o;
              }, {});

              done();
            });

        });
      }
    ], function(err) {
      if (err) res.serverError(err + ' metrics are unavailable.');
      res.send(output);
    });
  },


  /**
   * returns the list of all possible permission types
   * Used for populating options in the admin pages
   * eg: /api/admin/findAllPermissions
   */
  findAllPermissions: function(req, res) {
    //lookup all of the various permission/user types
    Permissions.find().exec(function (err, permissions) {
      if (err) { return res.send(400, { message: "Failed to lookup permissions" }); }
      return res.send({ permissions: permissions });
    });
  },


  /**
   * Unlock a user's account by resetting their password attempts
   * @param id the user id to clear password attempts
   */
  unlock: function (req, res) {
    if (!req.route.params.id) {
      return res.send(400, { message: 'Must specify a user id for this action.' });
    }
    User.findOneById(req.route.params.id, function (err, user) {
      if (err) { return res.send(400, { message: 'An error occurred looking up this user.', error: err }); }
      user.passwordAttempts = 0;
      user.save(function (err) {
        if (err) { return res.send(400, { message: 'An error occurred resetting password attempts.', error: err }); }
        return res.send(user);
      });
    });
  },

  /**
  * List recent notifications for activity feed
  * eg: /api/admin/activities
  */
  activities: function (req, res) {
    // Query parameters
    var page = parseInt(req.param('page', 1)),
        limit = req.param('limit', 50),
        sort = req.param('sort', 'createdAt desc');

    // Set up templates to for what data needs to be returned
    var templates = {

      newComment: function(event, done) {
        var activity = {
              type: 'newComment',
              createdAt: event.createdAt,
              comment: {},
              userId: null
            },
            steps = [];

        // Get comment model
        steps.push(function(done) {
          var id = (event.model || {}).id;
          Comment.findOne({ id: id }).exec(function(err, result) {
            if (err) return done('Failed to find model' + err);
            activity.comment = result || {};
            activity.comment.value = activity.comment.value || "";
            done();
          });
        });

        // Get comment user
        steps.push(function(done) {
          var comment = activity.comment;
          User.findOne({ id: comment.userId }).exec(function(err, result) {
            if (err) return done('Failed to find model' + err);
            activity.user = result || {};
            done();
          });
        });

        // Get comment task / project
        steps.push(function(done) {

          var comment = activity.comment,
              type = (comment.projectId || null ) ? 'project' : 'task',
              typeId = comment.projectId || comment.taskId || null;

          sails.models[type].findOne({ id: typeId }).exec(function(err, result) {
            if (err) return done('Failed to find model' + err);
            activity.itemType = type;
            activity.item = result || {};
            done();
          });
        });

        async.series(steps, function(err) {
          if (!activity.comment || activity.comment.value === "") {
            activity.comment = {};
          }
          done(err, activity);
        });

      },

      newVolunteer: function(event, done) {
        var activity = {
          type: 'newVolunteer',
          createdAt: event.createdAt
        },
        steps = [];

        // Get task model
        steps.push(function(done) {
          var id = (event.model || {}).taskId;
          Task.findOne({ id: id }).exec(function(err, result) {
            if (err) return done('Failed to find model' + err);
            activity.task = result;
            done();
          });
        });

        // Get user model
        steps.push(function(done) {
          var id = (event.model || {}).userId;
          User.findOne({ id: id }).exec(function(err, user) {
            if (err) return done('Failed to find model' + err);
            activity.user = user;
            done();
          });
        });

        async.series(steps, function(err) {
          done(err, activity);
        });
      },

      newUser: function(event, done) {
        var activity = {
          type: 'newUser',
          createdAt: event.createdAt
        },
        steps = [];

        // Get user model
        steps.push(function(done) {
          var id = (event.model || {}).id;
          User.findOne({ id: id }).exec(function(err, user) {
            if (err) return done('Failed to find model' + err);
            activity.user = user;
            done();
          });
        });

        async.series(steps, function(err) { done(err, activity); });
      },

      newTask: function(event, done) {
        var activity = {
          type: 'newTask',
          createdAt: event.createdAt
        },
        steps = [];

        // Get task model
        steps.push(function(done) {
          var id = (event.model || {}).id;
          Task.findOne({ id: id }).exec(function(err, task) {
            if (err) return done('Failed to find model' + err);
            activity.task = task;
            done();
          });
        });

        // Get user model
        steps.push(function(done) {
          if (!activity.task) return done();
          User.findOne({ id: activity.task.userId }).exec(function(err, user) {
            if (err) return done('Failed to find model' + err);
            activity.user = user;
            done();
          });
        });

        async.series(steps, function(err) { done(err, activity); });
      }

    };

    // Map actions to templates
    var actions = {
      'comment.create.owner': templates.newComment,
      'volunteer.create.thanks': templates.newVolunteer,
      'user.create.welcome': templates.newUser,
      'task.create.thanks': templates.newTask
    };

    // Get active notifications
    Notification.find({})
      .sort(sort)
      .paginate({ page: page, limit: limit})
      .exec(next);

    // Process notifications
    function next(err, notifications) {
      if (err) return res.send(400, {
        message: 'An error occurred looking up recent activities.',
        error: err
      });

      var activities = [];

      // Apply templates
      async.map(notifications, function(notification, done) {
        if (actions[notification.action]) {
          actions[notification.action](notification, done);
        } else {
          done();
        }
      }, function(err, results) {
        if (err) return res.send(400, {
          message: 'An error occurred looking up recent activities.',
          error: err
        });

        // Remove falsy items
        results = _.compact(results);

        // Return templates
        res.send(results);
      });

    }

  },

  /**
  * List tasks
  * eg: /api/admin/tasks
  */
  tasks: function (req, res) {
    var page = parseInt(req.param('page', 1)),
        limit = req.param('limit', 1000),
        sort = req.param('sort', 'createdAt desc'),
        output = {
          open: 0,
          withSignups: 0,
          assigned: 0,
          completed: 0
        },
        openTasks,
        steps = [];

    // Get tasks
    steps.push(function(done) {
      Task.find({ state: ['draft', 'open', 'public', 'assigned', 'completed'] })
        .sort(sort)
        .paginate({ page: page, limit: limit})
        .exec(function(err, tasks) {
          if (err) { return done(err); }
          openTasks = _.where(tasks, function(task) { return task.isOpen(); });
          User.find({ id: _.pluck(tasks, 'userId') }).exec(function(err, users) {
            if (err) { return done(err); }

            tasks.forEach(function(task, i) {
              tasks[i].user = _.findWhere(users, { id: task.userId });
            });
            done(null, tasks);
          });
        });
    });

    // Get volunteers
    steps.push(function(done) {
      Volunteer.find({ taskId: _.pluck(openTasks, 'id') }).exec(function(err, result) {
        if (err) { return done(err); }

        var userIds = _.pluck(result, 'userId');
        User.find({ id: userIds }).exec(function(err, users) {
          if (err) { return done(err); }

          result.forEach(function(volunteer, i) {
            result[i].user = _.findWhere(users, { id: volunteer.userId });
          });
          done(null, result);
        });
      });
    });

    // Build API response
    async.series(steps, function(err, results) {
      if (err) { return res.send(400, { message: 'Error looking up tasks', err: err}); }

      var tasks = results[0],
          volunteers = results[1];

      // Populate volunteers for each task
      tasks.forEach(function(task, i) {
        tasks[i].volunteers = _.where(volunteers, { taskId: task.id });
      });

      // Set output properties
      output.drafts = _.where(tasks, function(task) { return task.state === 'draft'; });
      output.assigned = _.where(tasks, function(task) { return task.state === 'assigned'; });
      output.completed = _.where(tasks, function(task) { return task.state === 'completed'; });
      output.withSignups = _.where(tasks, function(task) {
        return _(volunteers).pluck('taskId').uniq().value().indexOf(task.id) >= 0;
      });

      // Output the remaining open tasks
      output.open = openTasks;

      res.json(output);
    });

  },

  /**
  * Measure key interactions: http://git.io/AOkF
  * eg: /api/admin/interactions
  */
  interactions: function(req, res) {
    /**
    * The interaction metric is the total of the following actions:
    * + someone signs up for an opportunity
    * + task creator assigns the opportunity
    * + posting to the discussion
    * + marking a task completed
    * + someone creates an opportunity in draft
    * + an opportunity is published
    */
    var interactions = {
          signups: 0,
          assignments: 0,
          posts: 0,
          completions: 0,
          drafts: 0,
          publishes: 0
        },
        page = parseInt(req.param('page', 1)),
        limit = req.param('limit', 1000),
        sort = req.param('sort', 'createdAt desc'),
        steps = [];

    steps.push(function(done) {
      Task.find({}).sort(sort).paginate({
        page: page,
        limit: limit
      }).exec(function(err, tasks) {
        if (err) { return done(err); }
        interactions.assignments = tasks.reduce(function(count, task) {
          return (task.assignedAt) ? count + 1 : count;
        }, 0);
        interactions.completions = tasks.reduce(function(count, task) {
          return (task.completedAt) ? count + 1 : count;
        }, 0);
        interactions.drafts = tasks.reduce(function(count, task) {
          return (task.createdAt) ? count + 1 : count;
        }, 0);
        interactions.publishes = tasks.reduce(function(count, task) {
          return (task.publishedAt) ? count + 1 : count;
        }, 0);
        done();
      });
    });

    steps.push(function(done) {
      Comment.count({}).exec(function(err, count) {
        if (err) { return done(err); }
        interactions.posts = count;
        done();
      });
    });

    steps.push(function(done) {
      Volunteer.count({}).exec(function(err, count) {
        if (err) { return done(err); }
        interactions.signups = count;
        done();
      });
    });

    async.parallel(steps, function(err) {
      if (err) {
        return res.send(400, {
          message: 'Error generating interactions.',
          err: err
        });
      }
      res.send(interactions);
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AdminController)
   */
  _config: {}

};
