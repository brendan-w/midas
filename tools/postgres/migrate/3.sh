#!/bin/bash

# Set up a table to store sessions
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE \"task\"
  ADD COLUMN \"publishedAt\" timestamp with time zone,
  ADD COLUMN \"assignedAt\" timestamp with time zone,
  ADD COLUMN \"completedAt\" timestamp with time zone;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 3 WHERE schema = 'current';"
