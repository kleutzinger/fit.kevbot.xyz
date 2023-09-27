import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
const port = process.env.PORT || 5000;
const base_url = process.env.BASE_URL || `http://localhost:${port}`;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
import { join } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import pkg from "body-parser";
import {
  getMachineNames,
  getWorkouts,
  addMachineName,
  addWorkout,
  workoutSchema,
  machineSchema,
} from "./db.js";

const { urlencoded } = pkg;

// handle form data
app.use(urlencoded({ extended: true }));

import { auth } from "express-openid-connect";

const config = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH_RANDOM_STRING,
  baseURL: base_url,
  clientID: "wILIKtGWGdGjw83OQoxrvCXdqKJy97LX",
  issuerBaseURL: "https://dev-4gfidufu1t4at7rq.us.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

function req2db(req) {
  // return db name given a request
  return req?.oidc?.user?.email?.replace("@", "_")?.replace(".", "_") + ".db";
}

app.get("/machine-list", (req, res) => {
  const db_name = req2db(req);
  const machines = getMachineNames(db_name);
  res.send(html`${machines.map((machine) => `<option>${machine}</option>`)}`);
});

app.get("/download-db", (req, res) => {
  const db_name = req2db(req);
  res.sendFile(join(__dirname, "..", "db", db_name));
});

app.get("/workouts", (req, res) => {
  const db_name = req2db(req);
  const workouts = getWorkouts(db_name);
  res.send(
    html`${workouts.map(
      (workout) =>
        `<p><tr><td>${workout.machine_name}</td><td>${workout.weight}</td><td>${workout.reps}</td><td>${workout.datetime}</td></tr></p>`,
    )}`,
  );
});

app.post("/submit-workout", (req, res) => {
  const db_name = req2db(req);
  req.body.datetime = new Date().toISOString();
  let submitObj = {};
  try {
    submitObj = workoutSchema.parse(req.body);
    const serverResp = addWorkout(submitObj, db_name);
    res.send(
      `I submitted: ${JSON.stringify(submitObj, null, 2)}  ${JSON.stringify(
        serverResp,
      )}`,
    );
  } catch (err) {
    console.log(err);
    res.send("Invalid workout");
  }
});

app.get("/user-info", (req, res) => {
  const user = req?.oidc?.user;
  const email = user?.email;
  const name = user?.name;
  res.send(html`<p>${email} ${name}</p>`);
});

app.post("/new-machine", (req, res) => {
  const db_name = req2db(req);
  req.body.datetime = new Date().toISOString();
  let submitObj = req.body.name;
  try {
    let serverResp = addMachineName(submitObj, db_name);
    res.send(
      `I submitted: ${JSON.stringify(submitObj, null, 2)}  ${JSON.stringify(
        serverResp,
      )}`,
    );
  } catch (err) {
    console.log(err);
    return res.send("Invalid machine");
  }
});

app.get("/style.css", (_, res) => {
  res.sendFile(__dirname + "/style.css");
});

app.get("/admin", (_, res) => {
  res.sendFile(__dirname + "/admin.html");
});

app.get("/", (req, res) => {
  console.log(req?.oidc?.user?.email);
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
