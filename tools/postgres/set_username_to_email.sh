#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh

# this fixes the database errors that were caused by a bug fixed in 0.2.0
# https://github.com/18F/midas-open-opportunities/issues/60
psql -U $POSTGRESQL_USERNAME -c "UPDATE midas_user SET username=email FROM (SELECT \"email\", \"userId\" FROM useremail ORDER BY id DESC) AS ue WHERE (username is null OR username = '') AND midas_user.id = \"userId\""
