import dotenv from "dotenv";
dotenv.config();
import { join } from "path";
import Database from "better-sqlite3";
const DB_NAME = process.env.DB_NAME || "foobar.db";
const DB_DIR = process.env.DB_DIR || "./db";
const DB_PATH = join(DB_DIR, DB_NAME);
const db = new Database(DB_PATH, { verbose: console.log });
db.pragma("journal_mode = WAL");

const workoutTableDef =
  "CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, machine_name TEXT, weight INTEGER, reps INTEGER, datetime TEXT)";

db.exec(workoutTableDef);

const knownMachinesDef =
  "CREATE TABLE IF NOT EXISTS machines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE);";

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
].map((name) => ({ name }));

// insert default machines if not already in db
const insertMachine = db.prepare("INSERT INTO machines (name) VALUES (@name)");

const insertManyMachines = db.transaction((machines) => {
  for (const machine of machines) insertMachine.run(machine);
});

if (!db.prepare("SELECT * FROM machines").all().length) {
  insertManyMachines(starterMachines);
}

// insert into db
const insert = db.prepare(
  "INSERT INTO workouts (machine_name, weight, reps, datetime) VALUES (@machine_name, @weight, @reps, @datetime)",
);

const insertMany = db.transaction((workouts) => {
  for (const workout of workouts) insert.run(workout);
});

const addWorkout = (workout) => {
  insertMany([workout]);
};

const getMachines = () =>
  db
    .prepare("SELECT * FROM machines")
    .all()
    .map(({ name }) => name);

const getWorkouts = () => db.prepare("SELECT * FROM workouts").all();
const addMachine = (machine_name) => {
  // handle unique constraint
  if (getMachines().includes(machine_name)) return;
  const obj = { name: machine_name };
  insertManyMachines([obj]);
};

export { insertMany, db, addWorkout, getMachines, addMachine, getWorkouts };
