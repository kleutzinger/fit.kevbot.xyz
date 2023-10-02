--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- convert watts column to energy column in workouts table
ALTER TABLE workouts RENAME COLUMN watts TO energy;
ALTER TABLE machines RENAME COLUMN watts_active TO energy_active;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

-- convert energy column to watts column in workouts table
ALTER TABLE workouts RENAME COLUMN energy TO watts;
ALTER TABLE machines RENAME COLUMN energy_active TO watts_active;
