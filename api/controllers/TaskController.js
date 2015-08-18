/**
 * TaskController
 *
 * @module    :: Controller
 * @description :: Interaction with tasks
 */
var taskUtil = require('../services/utils/task');
var userUtil = require('../services/utils/user');
var exportUtil = require('../services/utils/export');
var i18n = require('i18next');

module.exports = {

  find: function (req, res) {
    var user = (req.user) ? req.user[0] : null,
        where = {};

    if (req.task) {
      taskUtil.getMetadata(req.task, user, function (err) {
        if (err) { return res.send(400, { message: i18n.t('taskAPI.errMsg.likes', 'Error looking up task likes.') }); }
        // taskUtil.getVolunteers(req.task, function (err) {
          // if (err) { return res.send(400, { message: i18n.t('taskAPI.errMsg.volunteers','Error looking up task volunteers.') }); }
          return res.send(req.task);
        // });
      });
      return;
    }
    // Only show drafts for current user
    if (user) {
      where = { or: [{
        state: {'!': 'draft'}
      }, {
        state: 'draft',
        userId: user.id
      }]};
    } else {
      where.state = {'!': 'draft'};
    }

    // run the common task find query
    taskUtil.findTasks(where, function (err, tasks) {
      if (err) { return res.send(400, err); }
      return res.send({ tasks: tasks });
    });
  },

  findOne: function(req, res) {
    module.exports.find(req, res);
  },

  findAllByProjectId: function (req, res) {
    Task.findByProjectId(req.params.id)
    .populate('tags')
    .sort({'updatedAt': -1})
    .exec(function(err, tasks) {
      if (err) return res.send(err, 500);
      res.send({ tasks: tasks });
    });
  },

  copy: function(req, res) {
    Task.findOneById(req.body.taskId)
    .populate('tags')
    .exec(function(err, task) {
      if (err) return res.send(err, 500);

      // Create a new task draft, copying over the following from the original:
      // projectId, title, description, tags
      var taskCopyData = {
        title: req.body.title !== undefined ? req.body.title : task.title,
        description: task.description,
        userId: req.body.userId,
        state: 'draft',
        tags: task.tags
      };

      Task.create(taskCopyData)
      .exec(function(err, newTask) {
        if (err) return res.send(err, 500);

        res.send({ taskId: newTask.id, title: newTask.title });
      });
    });
  },

  export: function (req, resp) {
    Task.find().exec(function (err, tasks) {
      if (err) {
        sails.log.error("task query error. " + err);
        resp.send(400, {message: 'Error when querying tasks.', error: err});
        return;
      }
      sails.log.debug('task export: found %s tasks', tasks.length)

      User.find({id: _.pluck(tasks, 'userId')}).exec(function (err, creators) {
        if (err) {
          sails.log.error("task creator query error. " + err);
          resp.send(400, {message: 'Error when querying task creators.', error: err});
          return;
        }
        sails.log.debug('task export: found %s creators', creators.length)
        for (var i=0; i < tasks.length; i++) {
          var creator = _.findWhere(creators, {id: tasks[i].userId});
          tasks[i].creator_name = creator ? creator.name : "";
        }

        var processVolunteerQuery = function (err, volQueryResult) {
          if (err) {
            sails.log.error("volunteer query error. " + err);
            resp.send(400, {message: 'Error when counting volunteers', error: err});
            return;
          }
          var volunteers = volQueryResult.rows;
          sails.log.debug('task export: found %s task volunteer counts', volunteers ? volunteers.length : 0)
          for (var i=0; i < tasks.length; i++) {
            var taskVols = _.findWhere(volunteers, {id: tasks[i].id});
            tasks[i].signups = taskVols ? parseInt(taskVols.count) : 0;
          }
          // gathered all data, render and return as file for download
          exportUtil.renderCSV(Task, tasks, function (err, rendered) {
            if (err) {
              sails.log.error("task export render error. " + err);
              resp.send(400, {message: 'Error when rendering', error: err})
              return;
            }
            resp.set('Content-Type', 'text/csv');
            resp.set('Content-disposition', 'attachment; filename=tasks.csv');
            resp.send(200, rendered);
          });
        };

        // Waterline ORM groupby/count doesn't work yet, so query manually
        if ('query' in Volunteer) {
          var sql = 'SELECT "taskId" AS id, sum(1) AS count FROM volunteer GROUP BY "taskId"';
          Volunteer.query(sql, processVolunteerQuery);
        } else {
          sails.log.info("bypassing volunteer query, must be in a test");
          // Since our testing backend doesn't handle sql, we need to bypass
          processVolunteerQuery(null, []);
        }
      });
    });
  }

};
