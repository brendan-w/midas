#!/bin/bash

# include main environment variables
source $(dirname "$(realpath "$0")")/../env.sh

# Revoke admin priviledges from the user with the given ID
psql -U $POSTGRESQL_USERNAME -c "UPDATE \"midas_user\" SET \"isAdmin\"=FALSE WHERE \"id\"= $1;" $POSTGRESQL_DATABASE
