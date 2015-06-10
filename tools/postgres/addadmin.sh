#!/bin/bash

# include main environment variables
source $(dirname "$(realpath "$0")")/../env.sh

# Makes the user with the given ID an administrator
psql -U $POSTGRESQL_USERNAME -c "UPDATE \"midas_user\" SET \"isAdmin\"=TRUE WHERE \"id\"= $1;" $POSTGRESQL_DATABASE
