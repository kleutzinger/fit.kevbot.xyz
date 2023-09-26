import express from "express";
const app = express();
const port = process.env.PORT || 5000;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import pkg from "body-parser";
import {
  db,
  getMachineNames,
  getWorkouts,
  addMachineName,
  addWorkout,
  workoutSchema,
} from "./db.js";

const { urlencoded } = pkg;

// handle form data
app.use(urlencoded({ extended: true }));

app.get("/machine-list", (_, res) => {
  const machines = getMachineNames();
  res.send(html`${machines.map((machine) => `<option>${machine}</option>`)}`);
});

app.post("/submit-workout", (req, res) => {
  console.log(req.body);
  req.body.datetime = new Date().toISOString();
  let submitObj = {};
  try {
    submitObj = workoutSchema.parse(req.body);
  } catch (err) {
    console.log(err);
    res.send("Invalid workout");
  }
  const serverResp = addWorkout(submitObj);
  res.send(
    `I submitted: ${JSON.stringify(submitObj, null, 2)}  ${JSON.stringify(
      serverResp,
    )}`,
  );
});

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
