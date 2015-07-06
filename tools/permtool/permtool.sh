#!/bin/bash

# silly hack to get sails to launch outside of the source directory
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/../../
source ./tools/env.sh
./tools/permtool/permtool.js $1
