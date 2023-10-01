--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS workouts;

DROP TABLE IF EXISTS machines;

DROP TABLE IF EXISTS users;

CREATE TABLE workouts (
    id integer PRIMARY KEY AUTOINCREMENT,
    datetime text,
    note text,
    user_email text,
    duration real DEFAULT 0,
    weight real DEFAULT 0,
    reps real DEFAULT 0,
    distance real DEFAULT 0,
    watts real DEFAULT 0,
    machine_id integer,
    FOREIGN KEY (machine_id) REFERENCES machines (id)
);

CREATE TABLE machines (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text,
    datetime text,
    note text,
    user_email text,
    display_order integer DEFAULT 0,
    weight_active integer DEFAULT 0,
    reps_active integer DEFAULT 0,
    duration_active real DEFAULT 0,
    distance_active integer DEFAULT 0,
    watts_active integer DEFAULT 0
);

CREATE TABLE users (
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

CREATE TABLE workouts (
    id integer PRIMARY KEY AUTOINCREMENT,
    machine_name text,
    datetime text,
    note text,
    user_email text,
    duration real DEFAULT 0,
    weight real DEFAULT 0,
    reps real DEFAULT 0,
    distance real DEFAULT 0,
    watts real DEFAULT 0
);

CREATE TABLE machines (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text,
    datetime text,
    note text,
    user_email text,
    display_order integer DEFAULT 0,
    weight_active integer DEFAULT 0,
    reps_active integer DEFAULT 0,
    duration_active real DEFAULT 0,
    distance_active integer DEFAULT 0,
    watts_active integer DEFAULT 0
);

CREATE TABLE users (
    id integer PRIMARY KEY AUTOINCREMENT,
    email text,
    note text,
    datetime text
);

