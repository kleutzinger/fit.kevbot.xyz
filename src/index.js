import dotenv from "dotenv";
dotenv.config();
const NO_AUTH = process.env.NO_AUTH || false;
import { join } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from "express";
import TimeAgo from "javascript-time-ago";
// English.
import en from "javascript-time-ago/locale/en.json";
TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");
const app = express();
const port = process.env.PORT || 5000;
const base_url = process.env.BASE_URL || `http://localhost:${port}`;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
import { create } from "express-handlebars";
const hbs = create({
  defaultLayout: "page",
  extname: ".hbs.html",
  helpers: {
    ifeq: function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
  },
});
const viewsDir = join(__dirname, "views");
app.engine(".hbs.html", hbs.engine);
app.set("view engine", "hbs.html");
app.set("views", viewsDir);
import pkg from "body-parser";
import {
  getMachineNames,
  getWorkouts,
  getMachines,
  deleteMachine,
  addMachineName,
  addWorkout,
  workoutSchema,
  deleteWorkout,
  getCSV,
  updateDBItem,
  machineSchema,
  getJSON,
  initUser,
  zodKeys,
} from "./db.js";

const { urlencoded } = pkg;

// handle form data
app.use(urlencoded({ extended: true }));

import { auth } from "express-openid-connect";

const auth0Config = {
  authRequired: NO_AUTH ? false : true,
  auth0Logout: true,
  secret: process.env.AUTH_RANDOM_STRING,
  baseURL: base_url,
  clientID: "wILIKtGWGdGjw83OQoxrvCXdqKJy97LX",
  issuerBaseURL: "https://dev-4gfidufu1t4at7rq.us.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(auth0Config));

function req2email(req) {
  if (NO_AUTH) return "NOAUTH@fake.com";
  return req?.oidc?.user?.email;
}

app.use(express.static(join(__dirname, "..", "public")));

app.get("/machine-list", (req, res) => {
  const user_email = req2email(req);
  const machines = getMachineNames(user_email);
  res.send(
    html`${machines.map((machine) => `<option>${machine}</option>`).join("")}`,
  );
});

app.get("/user-info", (req, res) => {
  res.render("user-info", { layout: "bare", user: req.oidc.user });
});

app.get("/user-email", (req, res) => {
  const user_email = req2email(req);
  res.send(user_email);
});

app.get("/download-db", (req, res) => {
  const user_email = req2email(req);
  res.sendFile(join(__dirname, "..", db_dir, user_email));
});

app.get("/download-csv", (req, res) => {
  const user_email = req2email(req);
  const csvText = getCSV(user_email);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${user_email}.csv"`,
  );
  res.send(csvText);
});

app.get("/download-json", (req, res) => {
  const user_email = req2email(req);
  const jsonText = getJSON(user_email);
  res.json(jsonText);
});

app.get("/workouts-table", (req, res) => {
  try {
    const { limit } = req.query;
    const user_email = req2email(req);
    const machine_id = req.query?.machine_id;
    const workouts = getWorkouts(user_email, machine_id, limit)
      .slice(0, limit)
      .map((workout) => {
        workout.ago = timeAgo.format(new Date(workout.datetime), "mini");
        return workout;
      });
    console.table(workouts);
    const columns = [
      "machine_name",
      "weight",
      "weight_active",
      "reps",
      "ago",
      "duration",
      "note",
      "id",
      "machine_id",
    ];
    res.render("workout-table", { layout: "bare", workouts, columns });
  } catch (err) {
    console.error(err);
    res.send(JSON.stringify(err));
  }
});

app.post("/submit-workout", (req, res) => {
  const user_email = req2email(req);
  req.body.datetime = new Date().toISOString();
  req.body.user_email = user_email;
  req.body.duration_s = parseInt(req.body.duration_s || 0);
  req.body.duration_m = parseInt(req.body.duration_m || 0);
  req.body.duration_h = parseInt(req.body.duration_h || 0);
  req.body.duration =
    req.body.duration_s +
    req.body.duration_m * 60 +
    req.body.duration_h * 60 * 60;
  let submitObj = {};
  try {
    submitObj = workoutSchema.parse(req.body);
    if (
      !submitObj.note &&
      !submitObj.weight &&
      !submitObj.reps &&
      !submitObj.duration &&
      !submitObj.distance &&
      !submitObj.watts
    ) {
      return res.send("Please fill out at least one field");
    }
    console.table(submitObj);
    const serverResp = addWorkout(submitObj);
    res.setHeader("HX-Trigger", "workout-modified");
    res.send(serverResp);
  } catch (err) {
    console.error(err);
    res.send(err?.issues);
  }
});

app.post("/new-machine", (req, res) => {
  const user_email = req2email(req);
  req.body.datetime = new Date().toISOString();
  let submitObj = req.body.name;
  try {
    let serverResp = addMachineName(submitObj, user_email);
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
  res.sendFile(join(__dirname, "output.css"));
});

app.post("/update-workout/:id", (req, res) => {
  try {
    console.table(req.body);
    const user_email = req2email(req);
    const workout_id = req.params?.id;
    if (!workout_id) {
      throw new Error("No workout id provided");
    }
    req.body.user_email = user_email;
    if (req.body.duration_s) {
      req.body.duration = parseInt(req.body.duration_s);
    }
    const newWorkout = workoutSchema.parse(req.body);
    newWorkout.id = workout_id;
    const serverResp = updateDBItem("workouts", newWorkout);
    res.setHeader("HX-Trigger", "workout-modified");
    res.send(serverResp);
  } catch (err) {
    console.error(err);
    res.send(err?.issues || err.message);
  }
});

app.post("/update-machine", (req, res) => {
  try {
    const user_email = req2email(req);
    const machine_id = req.body.id;
    req.body.user_email = user_email;
    const newMachine = machineSchema.parse(req.body);
    newMachine.id = machine_id;
    const serverResp = updateDBItem("machines", newMachine);
    res.send(serverResp);
  } catch (err) {
    console.error(err);
    res.send(err?.issues || err.message);
  }
});

app.post("/delete-workout", (req, res) => {
  try {
    const user_email = req2email(req);
    const workout_id = req?.query?.id;
    const serverResp = deleteWorkout(workout_id, user_email);
    res.setHeader("HX-Trigger", "workout-modified");
    res.send(serverResp);
  } catch (err) {
    console.error(err);
    res.status(400).send(JSON.stringify(err));
  }
});

app.post("/delete-machine", (req, res) => {
  try {
    const user_email = req2email(req);
    const machine_id = req?.query?.id;
    const serverResp = deleteMachine(machine_id, user_email);
    res.send(serverResp);
  } catch (err) {
    console.error(err);
    res.status(400).send(JSON.stringify(err));
  }
});

// app.get("/edit-workouts", (req, res) => {
//   const user_email = req2email(req);
//   const columns = zodSchemaToEditColumns(workoutSchema);
//   const workouts = getWorkouts(user_email);
//   columns.push({
//     key: "machine_name",
//     input_type: "text",
//     readonly: "readonly",
//   });
//   res.render("edit-page", {
//     user: req.oidc.user,
//     items: workouts,
//     endpoint: "workout",
//     columns,
//   });
// });

const zodSchemaToEditColumns = (schema) => {
  const readonly = ["id"];
  const hidden = ["user_email", "machine_id"];
  return zodKeys(schema)
    .filter((i) => !hidden.includes(i))
    .map((i) => {
      const out = {};
      if (readonly.includes(i)) {
        out.readonly = "readonly";
      }
      out.key = i;
      out.input_type = "text";
      return out;
    });
};

app.get("/edit-machines", (req, res) => {
  const user_email = req2email(req);
  const columns = zodSchemaToEditColumns(machineSchema);
  res.render("edit-page", {
    user: req.oidc.user,
    items: getMachines(user_email),
    endpoint: "machine",
    columns,
  });
});

app.get("/get-submit-workout-form", (req, res) => {
  const user_email = req2email(req);
  const machine = getMachines(user_email)[0];
  res.render("submit-workout-form", {
    layout: "bare",
    user: req.oidc.user,
    machine,
    endpoint: "/submit-workout",
  });
});

//
//   res.render("edit-workout-page", {
//   });
//
// app.get("/get-edit-workout-page/:id", (req, res) => {
//   hbs
//     .render(join("some.hbs"), { title: "Title", body: "Body" })
//     .then((renderedHtml) => {
//       response.send({ html: renderedHtml });
//     });
// });

app.get("/get-edit-workout-form/:id", (req, res) => {
  const user_email = req2email(req);
  const machine = getMachines(user_email)[0];
  const workout = getWorkouts(user_email).find((i) => i.id == req.params?.id);
  if (!workout) {
    return res.send(`<a href="/">back</a><br/>No workout found with that id`);
  }
  res.render("submit-workout-form", {
    layout: "bare",
    endpoint: `/update-workout/${workout.id}`,
    user: req.oidc.user,
    machine,
    workout,
    htmx: true,
  });
});

app.get("/admin", (_, res) => {
  res.render("admin");
});

app.get("/graph", (req, res) => {
  initUser(req2email(req));
  res.render("graph");
});

app.get("/", (req, res) => {
  initUser(req2email(req));
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
