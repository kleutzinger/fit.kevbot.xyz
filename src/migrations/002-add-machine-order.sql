--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- add a display_order column to the machines table with incrementing values per-user
ALTER TABLE machines ADD COLUMN display_order integer DEFAULT 0;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

-- remove the display order column from the machines table
ALTER TABLE machines DROP COLUMN  display_order;
