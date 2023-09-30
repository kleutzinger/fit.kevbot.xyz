--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
    id integer PRIMARY KEY AUTOINCREMENT,
    machine_name text,
    weight integer,
    reps integer,
    datetime text,
    note text,
    user_email text
);

CREATE TABLE IF NOT EXISTS machines (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text,
    datetime text,
    note text,
    user_email text
);

CREATE TABLE IF NOT EXISTS users (
    id integer PRIMARY KEY AUTOINCREMENT,
    email text,
    note text,
    datetime text
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS workouts;

DROP TABLE IF EXISTS machines;

DROP TABLE IF EXISTS users;

