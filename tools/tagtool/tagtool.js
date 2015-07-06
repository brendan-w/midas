#! /usr/bin/env node

var tool_utils = require("../tool_utils.js");

function help_and_quit(msg) {
  if(msg) {
    console.log("Error:\n    " + msg + "\n");
  }
  console.log("This is a tool for loading tags into the database in bulk.\n" +
              "\n" +
              "Usage:\n" +
              "    ./tagtools.js [file]\n" +
              "\n" +
              "    file - file containing a newline delimited list of tag values to be loaded\n");
  process.exit(1);
}


var args = process.argv.slice(2);
if (args.length < 1)
  help_and_quit("at least one argument is required");

try
{
  var tags = require("./" + args[0]);
}
catch(e)
{
  help_and_quit("Couldn't find JS file '" + args[0] + "'");
}


tool_utils.sailsForEach(tags, function(t, done) {
  //try a lookup, to prevent duplicate tags from being added
  TagEntity.count(t, function(err, count) {
    if(err)
    {
      console.log(err);
      return done();
    }
    else if(count > 0)
    {
      console.log("[skipped]    " + t.name);
      return done();
    }
    else
    {
      TagEntity.create(t).exec(function(err) {
        if(err) console.log(err);
        else console.log("[added]      " + t.type + " : " + t.name);
        return done();
      });
    }
  });

});
