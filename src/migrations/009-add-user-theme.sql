--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE users ADD COLUMN theme text DEFAULT 'autumn';

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

ALTER TABLE users DROP COLUMN theme;
