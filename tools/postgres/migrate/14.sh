#!/bin/bash

# Turn the old name column into the first name
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE midas_user RENAME COLUMN name TO firstname;"

# Add a column for the second name
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "ALTER TABLE midas_user ADD COLUMN lastname text;"


# Update the schema version
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "UPDATE schema SET version = 14 WHERE schema = 'current';"
