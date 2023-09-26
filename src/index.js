import express from "express";
const app = express();
const port = process.env.PORT || 5000;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import pkg from "body-parser";
import { db, getMachines, getWorkouts, addMachine, addWorkout } from "./db.js";

const { urlencoded } = pkg;

// handle form data
app.use(urlencoded({ extended: true }));

app.get("/machine-list", (_, res) => {
  const machines = db.prepare("SELECT * FROM machines").all();
  res.send(
    html`${machines.map((machine) => `<option>${machine.name}</option>`)}`,
  );
});

app.post("/submit-lift", (req, res) => {
  console.log(req.body);
  res.send(`I will submit: ${JSON.stringify(req.body, null, 2)}`);
});

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
