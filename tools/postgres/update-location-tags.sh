#!/bin/bash

# include main environment variables
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/../env.sh


# Updates location tags to use data from geocoder. Consolidates duplicative tags.

psql -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c "
-- update name and data for Washington DC 23
UPDATE tagentity SET name = 'Washington, D.C.' where id = 23;
UPDATE tagentity SET data = '{\"lat\":\"38.89511\",\"lon\":\"-77.03637\",\"source\":\"geonames\",\"sourceId\":\"4140963\",\"gmtOffset\":\"-5\",\"timeZoneId\":\"America/New_York\",\"dstOffset\":\"-4\"}' where id = 23;

-- move 390 to 23 in tag table
UPDATE tag SET \"tagId\" = 23 WHERE \"tagId\" = 390;

-- remove tag records for 296, 451, 652
DELETE FROM tag WHERE \"tagId\" = 296 OR \"tagId\" = 451 OR \"tagId\" = 652;

-- remove tagentity records for 296, 451, 652
DELETE FROM tagentity WHERE id = 296 OR id = 451 OR id = 652;

-- remove tagentity records for 390
DELETE FROM tagentity WHERE id = 390;

-- update name and data for Gaithersburg 395
UPDATE tagentity SET name = 'Gaithersburg, Maryland' where id = 395;
UPDATE tagentity SET data = '{\"lat\":\"39.14344\",\"lon\":\"-77.20137\",\"source\":\"geonames\",\"sourceId\":\"4355843\",\"gmtOffset\":\"-5\",\"timeZoneId\":\"America/New_York\",\"dstOffset\":\"-4\"}' where id = 395;
"
