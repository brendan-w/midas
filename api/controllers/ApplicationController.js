
var _ = require("underscore");

/**
 * ApplyController
 *
 * @module      :: Application Controller
 * @description :: Contains logic for handling application requests.
 */

module.exports = {

  create: function (req, res) {
    console.log("CREATE APPLICATION", req.body);

    //these files are submitted along with the application to ensure atomicity    
    if(req.body.files === undefined) return res.send(400, { message: "No files were submitted with this application" });
    if(req.body.rate  === undefined) return res.send(400, { message: "Application is missing the rate" });
    if(req.body.task  === undefined) return res.send(400, { message: "Application is missing the task ID" });
    if(req.body.rate <= 0)           return res.send(400, { message: "Application must have a positive rate" });


    var application_data = {
      task: req.body.task,
      rate: req.body.rate,
      user: req.user[0].id,
      state: "pending",
    };

    Application.create(application_data, function(err, a) {
      if(err || !a) return res.send(400, { message: "Failed to create application" });

      //now that we have an application ID to attach files to, attach the requested files
      //TODO:check for bad file IDs
      var attachments = _.map(req.body.files, function(file) {
        return {
          fileId: file,
          applicationId: a.id,
        };
      });

      Attachment.create(attachments, function(err) {
        if(err)
        {
          //unroll by deleting the application that was just created
          Application.destroy(a.id, function(err) {
            if(err) res.send(400, { message: "Failed to delete application after file attachment error. Your application may contain errors, please contact the administrator" });
            return res.send(400, { message: "Failed to attach files to application" });
          });
        }
        res.send(a);
      });
    });
  },

};
