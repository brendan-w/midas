#!/bin/bash

# Add a data column for tagEntities
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE tagentity ADD COLUMN data json;"

# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 4 WHERE schema = 'current';"
