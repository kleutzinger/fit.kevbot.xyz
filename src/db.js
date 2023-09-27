import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { join } from "path";
import Database from "better-sqlite3";
const DB_NAME = process.env.DB_NAME || "foobar.db";
const DB_DIR = process.env.DB_DIR || "./db";
const DB_PATH = join(DB_DIR, DB_NAME);
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const workoutTableDef =
  "CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, machine_name TEXT, weight INTEGER, reps INTEGER, datetime TEXT)";

db.exec(workoutTableDef);

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

// insert default machines if not already in db
const insertMachine = db.prepare(
  "INSERT OR IGNORE INTO machines (name, datetime) VALUES (@name, @datetime)",
);

const insertManyMachines = db.transaction((machines) => {
  for (const machine of machines) insertMachine.run(machine);
});

if (db.prepare("SELECT * FROM machines").all().length === 0) {
  insertManyMachines(starterMachines);
}

const insert = db.prepare(
  "INSERT INTO workouts (machine_name, weight, reps, datetime) VALUES (@machine_name, @weight, @reps, @datetime)",
);

const insertMany = db.transaction((workouts) => {
  for (const workout of workouts) insert.run(workout);
});

const addWorkout = (workout) => {
  try {
    insertMany([workout]);
    return workout;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getMachineNames = () =>
  db
    .prepare("SELECT * FROM machines")
    .all()
    .map(({ name }) => name);

const getWorkouts = () => db.prepare("SELECT * FROM workouts").all();
const addMachineName = (machine_name) => {
  const obj = { name: machine_name, datetime: new Date().toISOString() };
  insertManyMachines([obj]);
  return obj;
};

export {
  insertMany,
  db,
  addWorkout,
  getMachineNames,
  addMachineName,
  getWorkouts,
  workoutSchema,
  machineSchema,
};
