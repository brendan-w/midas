#!/bin/bash

# Add schema table
psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "CREATE TABLE \"schema\" (
  \"schema\" varchar,
  \"version\" integer
);
INSERT INTO \"schema\" (schema, version) VALUES ('current', 1);"
