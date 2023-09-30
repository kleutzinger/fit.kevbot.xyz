
--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- NOTE: SQLite does not support column type changes
-- so we make new columns, copy the data, drop the old columns, and rename the new columns
-- https://www.sqlite.org/lang_altertable.html

ALTER TABLE workouts ADD COLUMN duration_f real DEFAULT 0;
ALTER TABLE workouts ADD COLUMN weight_f real DEFAULT 0;
ALTER TABLE workouts ADD COLUMN reps_f real DEFAULT 0;

UPDATE workouts SET duration_f = duration;
UPDATE workouts SET weight_f = weight;
UPDATE workouts SET reps_f = reps;

ALTER TABLE workouts DROP COLUMN duration;
ALTER TABLE workouts DROP COLUMN weight;
ALTER TABLE workouts DROP COLUMN reps;

ALTER TABLE workouts RENAME COLUMN duration_f TO duration;
ALTER TABLE workouts RENAME COLUMN weight_f TO weight;
ALTER TABLE workouts RENAME COLUMN reps_f TO reps;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

ALTER TABLE workouts ADD COLUMN duration_i integer DEFAULT 0;
ALTER TABLE workouts ADD COLUMN weight_i integer DEFAULT 0;
ALTER TABLE workouts ADD COLUMN reps_i integer DEFAULT 0;

-- cast to int and round
-- this is a destructive operation
UPDATE workouts SET duration_i = CAST(duration AS integer);
UPDATE workouts SET weight_i = CAST(weight AS integer);
UPDATE workouts SET reps_i = CAST(reps AS integer);


ALTER TABLE workouts DROP COLUMN duration;
ALTER TABLE workouts DROP COLUMN weight;
ALTER TABLE workouts DROP COLUMN reps;

ALTER TABLE workouts RENAME COLUMN duration_i TO duration;
ALTER TABLE workouts RENAME COLUMN weight_i TO weight;
ALTER TABLE workouts RENAME COLUMN reps_i TO reps;

