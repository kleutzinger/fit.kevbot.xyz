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
// const verbose = process.env.NODE_ENV === "development" ? console.log : null;
const verbose = console.log;
const db = new Database(DB_PATH, { verbose });
db.pragma("journal_mode = WAL");

const workoutSchema = z.object({
  id: z.coerce.number().int().optional(),
  weight: z.coerce.number().default(0),
  reps: z.coerce.number().default(0),
  datetime: z.coerce.string().datetime(),
  note: z.string().optional(),
  duration: z.coerce.number().default(0),
  distance: z.coerce.number().default(0),
  watts: z.coerce.number().default(0),
  user_email: z.string(),
  machine_id: z.coerce.number().int(),
});

const machineSchema = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string(),
  datetime: z.coerce.string().datetime(),
  note: z.string().optional(),
  user_email: z.string(),
  display_order: z.coerce.number().int().default(0),
  distance_active: z.coerce.number().int().default(0),
  weight_active: z.coerce.number().int().default(0),
  duration_active: z.coerce.number().int().default(0),
  reps_active: z.coerce.number().int().default(0),
  watts_active: z.coerce.number().int().default(0),
});

const userSchema = z.object({
  id: z.coerce.number().int().optional(),
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
    { name: "Bench Press", weight_active: true, reps_active: true },
    { name: "Running", distance_active: true, duration_active: true },
    {
      name: "Rowing Machine",
      watts_active: true,
      duration_active: true,
      distance_active: true,
    },
    {
      name: "Biking",
      watts_active: true,
      duration_active: true,
      distance_active: true,
    },
  ].map((vals, idx) => {
    const toInsert = machineSchema.parse({
      datetime: new Date().toISOString(),
      user_email: user_email,
      display_order: idx,
      ...vals,
    });
    console.table(toInsert);
    return toInsert;
  });
  insertManyMachines(starterMachines);
}

const insertManyMachines = (machines) => {
  const insert = db.prepare(
    `INSERT INTO machines
          (name, datetime, user_email, display_order,
           distance_active, weight_active, duration_active, reps_active, watts_active)
    VALUES (@name, @datetime, @user_email, @display_order,
            @distance_active, @weight_active, @duration_active, @reps_active, @watts_active)
    `,
  );

  for (const machine of machines) {
    insert.run(machine);
  }
};

const insertManyWorkouts = (workouts) => {
  for (const workout of workouts) {
    console.table(workout);
    db.prepare(
      `INSERT INTO workouts
        (weight, reps, datetime, user_email, note, 
         duration, distance, watts, machine_id)
      VALUES
        (@weight, @reps, @datetime, @user_email, @note,
          @duration, @distance, @watts, @machine_id)`,
    ).run(workout);
  }
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
    .prepare(
      "SELECT * FROM machines WHERE user_email = ? ORDER BY display_order",
    )
    .all(user_email)
    .map((x) => `${x.name}`);
};

const getWorkouts = (user_email, limit) => {
  return db
    .prepare(
      "SELECT * FROM workouts WHERE user_email = ? ORDER BY datetime DESC LIMIT ?",
    )
    .all(user_email, limit || 10000);
};

const getMachines = (user_email, limit) => {
  return db
    .prepare(
      "SELECT * FROM machines WHERE user_email = ? ORDER BY datetime DESC LIMIT ?",
    )
    .all(user_email, limit || 10000);
};

const addMachineName = (machine_name, user_email) => {
  // get machine with largest display_order
  const maybeMachine = db
    .prepare(
      "SELECT * FROM machines WHERE user_email = ? ORDER BY display_order DESC LIMIT 1",
    )
    .get(user_email);
  const display_order = maybeMachine ? maybeMachine.display_order + 1 : 0;
  const obj = {
    name: machine_name,
    datetime: new Date().toISOString(),
    user_email: user_email,
    display_order: display_order,
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
    const machines = db
      .prepare(
        "SELECT * FROM machines WHERE user_email = ? ORDER BY datetime DESC",
      )
      .all(user_email)
      .map((x) => {
        delete x.id;
        delete x.user_email;
        return x;
      });

    return { workouts, machines };
  } catch (err) {
    console.error(err);
  }
}

function deleteWorkout(id, user_email) {
  const out = db
    .prepare("DELETE FROM workouts WHERE id = ? AND user_email = ?")
    .run(id, user_email);
  if (out.changes === 0) {
    throw new Error("No workout found with that id and email");
  }
  return "success";
}

function deleteMachine(id, user_email) {
  const out = db
    .prepare("DELETE FROM machines WHERE id = ? AND user_email = ?")
    .run(id, user_email);
  if (out.changes === 0) {
    throw new Error("No machine found with that id and email");
  }
  return "success";
}

function updateDBItem(tableName, allFields) {
  const { id, user_email, ...fields } = allFields;
  const out = db
    .prepare(
      `UPDATE ${tableName} SET ${Object.keys(fields)
        .map((key) => `${key} = @${key}`)
        .join(", ")} WHERE id = @id AND user_email = @user_email`,
    )
    .run(allFields);
  if (out.changes === 0) {
    throw new Error(
      `No ${tableName} found with  ${JSON.stringify({ id, user_email })}`,
    );
  }
  return `updated ${tableName}: ${JSON.stringify(fields)}`;
}

export {
  initUser,
  getCSV,
  getJSON,
  db,
  deleteWorkout,
  insertManyWorkouts,
  addWorkout,
  getMachineNames,
  getMachines,
  deleteMachine,
  updateDBItem,
  addMachineName,
  getWorkouts,
  workoutSchema,
  machineSchema,
  DB_PATH,
};
