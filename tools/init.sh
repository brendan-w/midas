##
#
# General Midas init script. Once install, `npm run init` will simply call this script
#
##

# bring in the environment vars
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/env.sh

# go up to the root source directory, or else sails wont lift properly
# cd ../

# init or migrate the database schema
$DIR/postgres/init.sh

# load intitial data into the database
$DIR/tagtool/tagtool.js $DIR/tagtool/unicef.txt
$DIR/permtool/permtool.sh unicef.js

echo "Done"
