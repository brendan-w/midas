#! /usr/bin/env node

function help_and_quit(msg) {
  if(msg) {
    console.log("Error:\n    " + msg + "\n");
  }
  console.log("This is a tool for loading tags into the database in bulk.\n" +
              "\n" +
              "Usage:\n" +
              "    ./tagtools.js [type] [file]\n" +
              "\n" +
              "    type - The string type of tags to be loaded\n" +
              "    file - file containing a newline delimited list of tag values to be loaded\n");
  process.exit(1);
}

var fs = require('fs');
var pg = require('pg');

// load db config file
try {
  var config = require('../../config/local');
} catch(e) {
  help_and_quit("Please create a config/local.js file with your postgresql information");
}

var args = process.argv.slice(2);

if (args.length < 2) {
  help_and_quit();
}

var tagType = args[0];
var tagFile = args[1];

if (tagType.length === 0) {
  help_and_quit('Tag type must be provided.');
}

var tags = [];

// load tags from file
if (fs.existsSync(tagFile)) {

  raw_tags = fs.readFileSync(tagFile).toString().split("\n");

  raw_tags.forEach(function(tag) {
    if (tag.length > 0)
    {
      parts = tag.trim().split(/\s*:\s*/);
      if(parts.length === 2)
      {
        parts[0] = parts[0].trim();
        parts[1] = parts[1].trim();
        if((parts[0].length > 0) && (parts[1].length > 0))
        {
          tags.push({ type: parts[0], name: parts[1] });
        }
        else
        {
          console.log("Failed to parse tag (empty type or name): " + tag);
        }
      }
      else
      {
        console.log("Failed to parse tag (couldn't find the delimeter): " + tag);
      }
    }
  });
} else {
  help_and_quit('Failed to find tag file (' + tagFile + ')');
}

// open database
var client = new pg.Client({
  host     : process.env.POSTGRESQL_IP || 'localhost',
  port     : process.env.POSTGRESQL_PORT || 5432,
  user     : process.env.POSTGRESQL_USERNAME || 'midas',
  password : process.env.POSTGRESQL_PASSWORD || 'midas',
  database : process.env.POSTGRESQL_DATABASE || 'midas',
});

client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished

client.connect(function (err) {
  if (err) {
    help_and_quit('Failed to connect to the database (' + err + ')');
  }
  // loop over records in the file, creating a record for each
  var date = new Date();

  tags.forEach(function(tag) {

    var query = {
      text: 'INSERT INTO tagEntity ("type","name","createdAt","updatedAt") SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT id FROM tagEntity WHERE "name" = $5 AND "type" = $6)',
      values: [tag.type, tag.name, date, date, tag.name, tag.type]
    }

    client.query(query, function(err, result) {
        if (err) {
          console.log('Failed to add tag to the database (' + tag.type + " : " + tag.name + ') with error '  + err);
        } else if (result.rowCount === 0) {
          console.log("[skipped]    " + tag.type + " : " + tag.name);
        } else {
          console.log("[added]    " + tag.type + " : " + tag.name);
        }
    });
  });
});
