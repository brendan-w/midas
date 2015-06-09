#!/bin/bash

# Add a fd column for files
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE file ADD COLUMN fd varchar;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 6 WHERE schema = 'current';"
