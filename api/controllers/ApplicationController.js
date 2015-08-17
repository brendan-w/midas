/**
 * ApplyController
 *
 * @module      :: Application Controller
 * @description :: Contains logic for handling application requests.
 */

module.exports = {

  create: function (req, res) {
    console.log("CREATE APPLICATION");
    res.send(200);
    /*
    var v = _.extend(req.body || {}, req.params);
    Apply.findOrCreate(v, v, function(err, newV) {
      if (err) { return res.send(400, { message: 'Error creating Apply entry' }); }
      return res.send(newV);
    });
    */
  },

};
