#!/bin/bash

# add a text duration column to jobs
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE task ADD COLUMN \"duration\" text"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 17 WHERE schema = 'current';"
