#!/bin/bash

# Sets up the database. If the database doesn't have the default schema,
# update it to the latest schema, which is stored in schema/current.sql.
# If a database does have a schema, but doesn't have a current schema version,
# start running migration scripts the begining. If the database does have a
# current schema version, apply migration scripts (migrate/*) until the
# database version is up to date.

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

SRC_DIR=$(cd "${0%/*}/"; pwd)
SCHEMA=$SRC_DIR/schema/current.sql
SCRIPTS=$SRC_DIR/migrate
DB=$POSTGRESQL_DATABASE
USER=$POSTGRESQL_USERNAME

# Get file names
FILES=($SCRIPTS/*.sh)
VERSIONS=()
for ((i=0; i<${#FILES[@]}; i++)); do
  VERSIONS+=(`echo ${FILES[$i]%%.*} | sed 's/.*\///'`)
done

# Sort file names
SORTED=($(printf '%s\n' "${VERSIONS[@]}"|sort -g))


# Get latest version
LENGTH=${#SORTED[@]}
LAST=$((LENGTH - 1))
LATEST=${SORTED[${LAST}]}

# Has the default schema been loaded?
PSQL=`psql -U $USER -d $DB -c "\dt"`
if [ "$PSQL" == "No relations found." ]; then

  echo "Loading current schema."

  # Load current schema
  psql -U $USER -d $DB -f $SCHEMA

  # Set version to latest
  psql -U $USER -d $DB -c "INSERT INTO \"schema\" (schema, version) VALUES ('current', $LATEST);"

else

  # Get the database's current version or set it to 0
  VERSION=`psql -U $USER -d $DB -tqA -c "SELECT version FROM schema WHERE schema = 'current'"`
  if [ "$?" != "0" ]; then
    VERSION=0
  fi

  echo "Current schema version: $VERSION."

  # If current version < latest version
  if [ "$VERSION" -lt "$LATEST" ]; then

    echo "Schema is out of date. Running migration scripts."

    # Loop through and apply unmigrated versions
    for ((i=$((VERSION+1)); i<=$LATEST; i++)); do
      $SCRIPTS/$i.sh
    done
  else
    echo "Schema is up to date."
  fi
fi
