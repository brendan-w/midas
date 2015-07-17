-- Query for reviewing and removing duplicate users
-- Modified from https://wiki.postgresql.org/wiki/Deleting_duplicates

-- It prioritizes keeping enabled accounts and those with recent logins
-- When you're ready to delete, change `SELECT *` to `DELETE`

SELECT * FROM midas_user
WHERE id IN (SELECT id
  FROM (SELECT id,
      ROW_NUMBER() OVER (partition BY username ORDER BY disabled,"updatedAt" DESC) AS rnum
    FROM midas_user) t
  WHERE t.rnum > 1);
