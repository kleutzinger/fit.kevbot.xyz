--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- add a display_order column to the machines table with incrementing values per-user
ALTER TABLE workouts ADD COLUMN duration integer DEFAULT 0;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

-- remove the display order column from the machines table
ALTER TABLE workouts DROP COLUMN duration;
