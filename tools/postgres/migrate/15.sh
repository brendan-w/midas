#!/bin/bash

# Add a column for the start time
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE task ADD COLUMN \"startedBy\" timestamp with time zone;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 15 WHERE schema = 'current';"
