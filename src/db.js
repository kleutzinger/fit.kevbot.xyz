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
// const verbose = process.env.NODE_ENV === "development" ? console.log : null;
const verbose = process.env.NODE_ENV === "development" ? console.log : null;
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
  energy: z.coerce.number().default(0),
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
  energy_active: z.coerce.number().int().default(0),
});

const userSchema = z.object({
  id: z.coerce.number().int().optional(),
  email: z.string().email(),
  note: z.string().optional(),
  datetime: z.coerce.string().datetime(),
});
// get zod object keys recursively
const zodKeys = (schema) => {
  // make sure schema is not null or undefined
  if (schema === null || schema === undefined) return [];
  // check if schema is nullable or optional
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
    return zodKeys(schema.unwrap());
  // check if schema is an array
  if (schema instanceof z.ZodArray) return zodKeys(schema.element);
  // check if schema is an object
  if (schema instanceof z.ZodObject) {
    // get key/value pairs from schema
    const entries = Object.entries(schema.shape);
    // loop through key/value pairs
    return entries.flatMap(([key, value]) => {
      // get nested keys
      const nested =
        value instanceof z.ZodType
          ? zodKeys(value).map((subKey) => `${key}.${subKey}`)
          : [];
      // return nested keys
      return nested.length ? nested : key;
    });
  }
  // return empty array
  return [];
};

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
      energy_active: true,
      duration_active: true,
      distance_active: true,
    },
    {
      name: "Biking",
      energy_active: true,
      duration_active: true,
      distance_active: true,
    },
    {
      name: "My Custom Activity",
      weight_active: true,
      reps_active: true,
      distance_active: true,
      duration_active: true,
      energy_active: true,
    },
  ].map((vals, idx) => {
    const toInsert = machineSchema.parse({
      datetime: new Date().toISOString(),
      user_email: user_email,
      display_order: idx,
      ...vals,
    });
    return toInsert;
  });
  insertManyMachines(starterMachines);
}

const insertManyMachines = (machines) => {
  const insert = db.prepare(
    `INSERT INTO machines
            (name, datetime, user_email, display_order,
             distance_active, weight_active, duration_active, reps_active, energy_active)
      VALUES (@name, @datetime, @user_email, @display_order,
              @distance_active, @weight_active, @duration_active, @reps_active, @energy_active)
      `,
  );

  for (const machine of machines) {
    insert.run(machine);
  }
};

const insertManyWorkouts = (workouts) => {
  for (const workout of workouts) {
    db.prepare(
      `INSERT INTO workouts
          (weight, reps, datetime, user_email, note, 
           duration, distance, energy, machine_id)
        VALUES
          (@weight, @reps, @datetime, @user_email, @note,
            @duration, @distance, @energy, @machine_id)`,
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

const getWorkouts = (user_email, machine_id, limit) => {
  if (machine_id !== undefined) machine_id = parseInt(machine_id).toString();
  const sql = `
    SELECT 
      workouts.*,
      machines.name AS machine_name,
      machines.id AS machine_id,
      machines.weight_active AS weight_active,
      machines.reps_active AS reps_active,
      machines.duration_active AS duration_active,
      machines.distance_active AS distance_active,
      machines.energy_active AS energy_active
    FROM workouts
    LEFT JOIN machines ON workouts.machine_id = machines.id
    WHERE workouts.user_email = ?
    ${machine_id ? "AND workouts.machine_id = ?" : ""}
    ORDER BY workouts.datetime DESC
    LIMIT ?
    `;
  if (machine_id) {
    return db.prepare(sql).all(user_email, machine_id, limit || 10000);
  }
  return db.prepare(sql).all(user_email, limit || 10000);
};

const getMachines = (user_email, limit) => {
  return db
    .prepare(
      "SELECT * FROM machines WHERE user_email = ? ORDER BY display_order DESC LIMIT ?",
    )
    .all(user_email, limit || 10000);
};

const getMachine = (user_email, machine_id) => {
  return db
    .prepare("SELECT * FROM machines WHERE user_email = ? AND id = ?")
    .get(user_email, machine_id);
};

const addMachine = (user_email, machine) => {
  // get machine with largest display_order
  const { display_order: biggest_display_order } = db
    .prepare(
      `SELECT display_order FROM machines WHERE
        user_email = ? ORDER BY display_order DESC LIMIT 1`,
    )
    .get(user_email);
  const display_order = (biggest_display_order || 0) + 1;
  machine.display_order = display_order;
  insertManyMachines([machine]);
  return machine;
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
        return x;
      });

    return { workouts, machines };
  } catch (err) {
    console.error(err);
  }
}

function deleteWorkout(id, user_email) {
  const machine_id = db
    .prepare("SELECT machine_id FROM workouts WHERE id = ? AND user_email = ?")
    .get(id, user_email).machine_id;
  const out = db
    .prepare("DELETE FROM workouts WHERE id = ? AND user_email = ?")
    .run(id, user_email);
  if (out.changes === 0) {
    throw new Error("No workout found with that id and email");
  }
  return { message: "success", machine_id };
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
  zodKeys,
  db,
  deleteWorkout,
  insertManyWorkouts,
  addWorkout,
  getMachineNames,
  getMachines,
  getMachine,
  deleteMachine,
  updateDBItem,
  addMachine as addMachineName,
  getWorkouts,
  workoutSchema,
  machineSchema,
  DB_PATH,
};
