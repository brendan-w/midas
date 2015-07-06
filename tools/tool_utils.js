var async = require('async');
var sails = require('sails');

module.exports = {

  sailsForEach: function(values, fn) {
    var config = {
      log: {
        level: 'error'
      },
    };

    //boot sails
    sails.lift(config, function(e) {
      async.each(values, fn, function() {
        //called when async finishes
        sails.lower();
        process.exit(0);
      });
    });

  },
};
