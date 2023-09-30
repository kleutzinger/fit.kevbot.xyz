import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { join } from "path";
import { existsSync } from "fs";
import Database from "better-sqlite3";
import { Parser } from "@json2csv/plainjs";

const DB_DIR = process.env.DB_DIR || "./db";
const DB_NAME = process.env.DB_NAME || "db.sqlite";
const DB_PATH = join(DB_DIR, DB_NAME);
// verbose if in dev
const verbose = process.env.NODE_ENV === "development" ? console.log : null;
const db = new Database(DB_PATH, { verbose });
db.pragma("journal_mode = WAL");

const workoutSchema = z.object({
  machine_name: z.string(),
  weight: z.coerce.number().int(),
  reps: z.coerce.number().int(),
  datetime: z.coerce.string().datetime(),
  note: z.string().optional(),
  user_email: z.string(),
});

const machineSchema = z.object({
  name: z.string(),
  datetime: z.coerce.string().datetime(),
  note: z.string().optional(),
  user_email: z.string(),
});

const userSchema = z.object({
  email: z.string().email(),
  note: z.string().optional(),
  datetime: z.coerce.string().datetime(),
});

function initUser(user_email) {
  if (!user_email) throw new Error("user_email is required");
  // check if user exists already
  const maybeUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(user_email);
  if (maybeUser) return;

  // add to user table
  db.prepare(
    "INSERT OR IGNORE INTO users (email, note, datetime) VALUES (@email, @note, @datetime)",
  ).run({
    email: user_email,
    note: "New User",
    datetime: new Date().toISOString(),
  });

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
  ].map((name) => ({
    name,
    datetime: new Date().toISOString(),
    user_email: user_email,
  }));
  insertManyMachines(starterMachines);
}

const insertManyMachines = (machines) => {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO machines (name, datetime, user_email) VALUES (@name, @datetime, @user_email)",
  );
  for (const machine of machines) {
    insert.run(machine);
  }
};

const insertManyWorkouts = (workouts) => {
  for (const workout of workouts)
    db.prepare(
      "INSERT INTO workouts (machine_name, weight, reps, datetime, user_email, note) VALUES (@machine_name, @weight, @reps, @datetime, @user_email, @note)",
    ).run(workout);
};

const addWorkout = (workout) => {
  try {
    insertManyWorkouts([workout]);
    return workout;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getMachineNames = (user_email) => {
  return db
    .prepare("SELECT * FROM machines WHERE user_email = ?")
    .all(user_email)
    .map((x) => x.name);
};

const getWorkouts = (user_email, limit) => {
  return db
    .prepare(
      "SELECT * FROM workouts WHERE user_email = ? ORDER BY datetime DESC LIMIT ?",
    )
    .all(user_email, limit || 10000);
};

const addMachineName = (machine_name, user_email) => {
  const obj = {
    name: machine_name,
    datetime: new Date().toISOString(),
    user_email: user_email,
  };
  insertManyMachines([obj]);
  return obj;
};

function getCSV(user_email) {
  try {
    const workouts = getWorkouts(user_email);
    const fieldsToRemove = ["id", "user_email"];
    for (const workout of workouts) {
      for (const field of fieldsToRemove) {
        delete workout[field];
      }
    }
    const parser = new Parser();
    const csv = parser.parse(workouts);
    return csv;
  } catch (err) {
    console.error(err);
  }
}

//** returns a JSON string of all your workouts */
function getJSON(user_email) {
  try {
    const workouts = getWorkouts(user_email);
    const fieldsToRemove = ["id", "user_email"];
    for (const workout of workouts) {
      for (const field of fieldsToRemove) {
        delete workout[field];
      }
    }
    return workouts;
  } catch (err) {
    console.error(err);
  }
}

export {
  initUser,
  getCSV,
  getJSON,
  db,
  insertManyWorkouts,
  addWorkout,
  getMachineNames,
  addMachineName,
  getWorkouts,
  workoutSchema,
  machineSchema,
  DB_PATH,
};
