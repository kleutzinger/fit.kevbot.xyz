--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
ALTER TABLE machines
    ADD COLUMN weight_active INTEGER DEFAULT 0;

ALTER TABLE machines
    ADD COLUMN reps_active INTEGER DEFAULT 0;

ALTER TABLE machines
    ADD COLUMN duration_active REAL DEFAULT 0;

ALTER TABLE workouts
    ADD COLUMN distance REAL DEFAULT 0;

ALTER TABLE machines
    ADD COLUMN distance_active INTEGER DEFAULT 0;

ALTER TABLE workouts
    ADD COLUMN watts REAL DEFAULT 0;

ALTER TABLE machines
    ADD COLUMN watts_active INTEGER DEFAULT 0;

-- ALTER TABLE workouts
--     ADD COLUMN FOREIGN KEY (machine_id) REFERENCES machines (id);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
ALTER TABLE machines
    DROP COLUMN weight_active;

ALTER TABLE machines
    DROP COLUMN reps_active;

ALTER TABLE machines
    DROP COLUMN duration_active;

ALTER TABLE workouts
    DROP COLUMN distance;

ALTER TABLE machines
    DROP COLUMN distance_active;

ALTER TABLE workouts
    DROP COLUMN watts;

ALTER TABLE machines
    DROP COLUMN watts_active;

-- ALTER TABLE workouts
--     DROP COLUMN machine_id;

