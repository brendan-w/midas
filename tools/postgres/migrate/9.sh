#!/bin/bash

# Add a model column for notifications
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE task ADD COLUMN \"completedBy\" timestamp with time zone;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 9 WHERE schema = 'current';"
