##
#
# General Midas init script. Once install, `npm run init` will simply call this script
#
##

# get the location of this script
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# go up to the root source directory, or else sails wont lift properly
# cd ../

# init or migrate the database schema
$DIR/postgres/init.sh

# load intitial data into the database
$DIR/tagtool/tagtool.js   unicef.tags
$DIR/permtool/permtool.sh unicef.perms

echo "Init Finished"
