import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { join } from "path";
import Database from "better-sqlite3";
const DB_DIR = process.env.DB_DIR || "./db";
const dbs = new Map();

const workoutSchema = z.object({
  machine_name: z.string(),
  weight: z.coerce.number().int(),
  reps: z.coerce.number().int(),
  datetime: z.coerce.string().datetime(),
});

const machineSchema = z.object({
  name: z.string(),
  datetime: z.coerce.string().datetime(),
});

function getDB(db_name) {
  if (!dbs.has(db_name)) {
    dbs.set(db_name, new Database(join(DB_DIR, db_name)));
    console.log("initting db " + db_name);
    initDB(dbs.get(db_name));
  }
  return dbs.get(db_name);
}

function initDB(db) {
  const workoutTableDef =
    "CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, machine_name TEXT, weight INTEGER, reps INTEGER, datetime TEXT)";

  db.exec(workoutTableDef);
  const knownMachinesDef =
    "CREATE TABLE IF NOT EXISTS machines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, datetime TEXT);";

  db.exec(knownMachinesDef);

  // insert default machines
  const starterMachines = [
    "Tricep Extension",
    "Leg Extension",
    "Chest Press",
    "Lat Pulldown",
    "Seated Rows",
    "Leg Lift",
    "Pec Fly",
    "Pec Fly (Reverse)",
    "Bicep Curl",
    "Shoulder Press",
    "Stairs",
  ].map((name) => ({ name, datetime: new Date().toISOString() }));
  if (db.prepare("SELECT * FROM machines").all().length === 0) {
    insertManyMachines(starterMachines, db);
  }
}

const insertManyMachines = (machines, db) => {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO machines (name, datetime) VALUES (@name, @datetime)",
  );
  for (const machine of machines) {
    insert.run(machine);
  }
};

const insertManyWorkouts = (workouts, db) => {
  for (const workout of workouts)
    db.prepare(
      "INSERT INTO workouts (machine_name, weight, reps, datetime) VALUES (@machine_name, @weight, @reps, @datetime)",
    ).run(workout);
};

const addWorkout = (workout, db_name) => {
  try {
    const db = getDB(db_name);
    insertManyWorkouts([workout], db);
    return workout;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getMachineNames = (db_name) => {
  return getDB(db_name)
    .prepare("SELECT * FROM machines")
    .all()
    .map((x) => x.name);
};

const getWorkouts = (db_name) =>
  getDB(db_name).prepare("SELECT * FROM workouts").all();

const addMachineName = (machine_name, db_name) => {
  const obj = { name: machine_name, datetime: new Date().toISOString() };
  insertManyMachines([obj], getDB(db_name));
  return obj;
};

export {
  insertManyWorkouts,
  addWorkout,
  getMachineNames,
  addMachineName,
  getWorkouts,
  workoutSchema,
  machineSchema,
};
