#!/bin/bash

# Add a model column for notifications
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE notification ADD COLUMN model json;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 7 WHERE schema = 'current';"
