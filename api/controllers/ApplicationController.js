/**
 * ApplyController
 *
 * @module      :: Application Controller
 * @description :: Contains logic for handling application requests.
 */

module.exports = {

  create: function (req, res) {
    console.log("CREATE APPLICATION", req.body);
    
    if(req.body.rate === undefined) return res.send(400, { message: "Application is missing the rate" });
    if(req.body.task === undefined) return res.send(400, { message: "Application is missing the task ID" });

    if(req.body.rate <= 0) return res.send(400, { message: "Application must have a positive rate" });

    var application = {
      task: req.body.task,
      rate: req.body.rate,
      user: req.user[0].id,
      state: "pending",
    };

    Application.create(application, function(err, a) {
      if(err || !a) return res.send(400, { message: "Failed to create application" });
      res.send(a);
    });
  },

};
