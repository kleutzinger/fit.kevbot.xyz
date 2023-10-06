
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- NOTE: SQLite does not support column type changes
-- so we make new columns, copy the data, drop the old columns, and rename the new columns
-- https://www.sqlite.org/lang_altertable.html

ALTER TABLE machines ADD COLUMN duration_active_i int DEFAULT 0;

UPDATE machines SET duration_active_i = CAST(duration_active AS int);

ALTER TABLE machines DROP COLUMN duration_active;

ALTER TABLE machines RENAME COLUMN duration_active_i TO duration_active;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

-- NOTE: SQLite does not support column type changes

ALTER TABLE machines ADD COLUMN duration_active_f float DEFAULT 0;

UPDATE machines SET duration_active_f = CAST(duration_active AS float);

ALTER TABLE machines DROP COLUMN duration_active;

ALTER TABLE machines RENAME COLUMN duration_active_f TO duration_active;

