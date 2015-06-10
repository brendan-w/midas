#!/bin/bash

# include main environment variables
source $(dirname "$(realpath "$0")")/../env.sh

# Drops the schema and recreates it, thereby removing all tables.
psql -U $POSTGRESQL_USERNAME -c "drop schema public cascade; create schema public;" $POSTGRESQL_DATABASE
