--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
-- new table machine_groups
-- id int
-- notes text
-- user_email text
-- machine_ids? TEXT "1,2,3,4"
-- date_created
-- date_updated
CREATE TABLE IF NOT EXISTS sequences (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text,
    note text,
    user_email text,
    machine_ids text,
    date_created text,
    date_updated text
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE machine_groups;

