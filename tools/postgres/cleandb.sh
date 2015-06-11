#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

# Drops the schema and recreates it, thereby removing all tables.
psql -U $POSTGRESQL_USERNAME -c "drop schema public cascade; create schema public;" $POSTGRESQL_DATABASE
