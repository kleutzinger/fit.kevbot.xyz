import dotenv from "dotenv";
dotenv.config();
const NO_AUTH = process.env.NO_AUTH || false;
import { join } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from "express";
import tracer from "tracer";
const logger = tracer.colorConsole();
import { themes } from "./utils/daisyui-themes.js";
import { a, option, button } from "@kleutzinger/html-builder";

const log = logger.log;

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");
const app = express();
const port = process.env.PORT || 5000;
const base_url = process.env.BASE_URL || `http://localhost:${port}`;
// const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
import { create } from "express-handlebars";
const hbs = create({
  defaultLayout: "bare",
  extname: ".hbs.html",
  helpers: {
    ifeq: function (a, b, options) {
      if (a == b) {
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
  getWorkouts,
  getMachines,
  deleteMachine,
  addMachineName as addMachine,
  addWorkout,
  insertDBItem,
  sequenceSchema,
  getSequences,
  deleteSequence,
  workoutSchema,
  deleteWorkout,
  getCSV,
  getUserTheme,
  updateUserTheme,
  updateDBItem,
  getMachine,
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
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_RANDOM_STRING,
  baseURL: base_url,
  clientID: "wILIKtGWGdGjw83OQoxrvCXdqKJy97LX",
  issuerBaseURL: "https://dev-4gfidufu1t4at7rq.us.auth0.com",
};

// redirect here if not authenticated
app.get("/signup", (_, res) => {
  res.render("signup", { layout: "page", nonavbar: true, theme: "retro" });
});

// Middleware to check if user is authenticated
const unauthorizedToSignup = (req, res, next) => {
  if (!req.oidc.isAuthenticated() && !NO_AUTH) {
    // Redirect unauthenticated users to the signup page
    return res.redirect("/signup");
  }
  next();
};

app.use(express.static(join(__dirname, "..", "public")));

// auth required everything below
app.use(auth(auth0Config));

// apply checkAuth to all routes
app.use(unauthorizedToSignup);

function req2email(req) {
  if (NO_AUTH) return "NOAUTH@fake.com";
  return req?.oidc?.user?.email;
}

app.get("/machine-name-options", (req, res) => {
  const user_email = req2email(req);
  const machines = getMachines(user_email);
  res.send(machines.map((m) => option({ value: m.id }, m.name)).join(""));
});

app.get("/machine-column-options", (_, res) => {
  const cols = [
    "weight",
    "note",
    "datetime",
    "reps",
    "duration",
    "distance",
    "energy",
  ];
  res.send(cols.map((i) => option({ value: i }, i)).join(""));
});

app.get("/user-info", (req, res) => {
  res.render("user-info", { user: req.oidc.user });
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

app.get("/full-workout-form", (req, res, next) => {
  try {
    const user_email = req2email(req);
    const machine_id = req.query?.machine_id;
    const include_table = req.query?.include_table || true;
    const edit_workout_id = req.query?.edit_workout_id;
    const edit = req.query?.edit == "true";
    const table_limit = 5;
    const post_endpoint = edit
      ? `/update-workout/${edit_workout_id}`
      : "/submit-new-workout";
    const machine = getMachine(user_email, machine_id);
    if (!machine) {
      throw new Error(
        `No machine found with id "${machine_id}" and email "${user_email}"`,
      );
    }
    const longToShort = {
      distance: "dist",
      weight: "wt",
      reps: "reps",
      duration: "dur",
      energy: "en",
    };
    const workouts = getWorkouts(user_email, machine_id).map((w) => {
      w.ago = timeAgo.format(new Date(w.datetime), "mini-minute");
      // add longToShort keys and copy values
      for (const [long, short] of Object.entries(longToShort)) {
        // convert duration to h:m:s
        if (long == "duration") {
          const h = Math.floor(w[long] / 3600);
          const m = Math.floor((w[long] % 3600) / 60);
          const s = Math.floor(w[long] % 60);
          // only show hours if > 0, always show minutes, always show seconds
          w[long] = `${h > 0 ? h + "h" : ""}${m}m${s}s`;
        }
        w[short] = w[long];
      }
      return w;
    });
    const workout =
      edit_workout_id != undefined &&
      workouts.find((i) => i.id == edit_workout_id);

    const columns = ["ago", "note"];
    for (const [long, short] of Object.entries(longToShort)) {
      const key_a = `${long}_active`;
      const is_active = machine[key_a];
      if (is_active) {
        columns.push(short);
      } else {
      }
    }
    res.render("full-workout-form", {
      workouts,
      workout,
      edit,
      post_endpoint,
      edit_workout_id,
      table_limit,
      columns,
      machine,
      include_table,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/submit-new-workout", (req, res, next) => {
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
      !submitObj.energy
    ) {
      throw new Error("Error submitting: Please fill out at lest one field");
    }
    const serverResp = addWorkout(submitObj);
    const machine_id = submitObj.machine_id;
    res.setHeader("HX-Trigger", "workout-modified-machine-id-" + machine_id);
    res.send(serverResp);
  } catch (err) {
    next(err);
  }
});

function renderSuccess(msg, res) {
  res.setHeader("HX-Retarget", ".toast-container");
  res.setHeader("HX-Reswap", "innerHTML");
  res.render("toast", { msg });
}

app.post("/new-machine", (req, res, next) => {
  try {
    const user_email = req2email(req);
    req.body.datetime = new Date().toISOString();
    req.body.user_email = user_email;
    req.body.weight_active = req.body.weight_active == "on";
    req.body.reps_active = req.body.reps_active == "on";
    req.body.duration_active = req.body.duration_active == "on";
    req.body.distance_active = req.body.distance_active == "on";
    req.body.energy_active = req.body.energy_active == "on";
    const machine = machineSchema.parse(req.body);
    const serverResp = addMachine(user_email, machine);
    console.log(serverResp);
    return renderSuccess(`Added machine "${machine.name}"`, res);
  } catch (err) {
    next(err);
  }
});

app.post("/new-sequence", (req, res, next) => {
  try {
    const user_email = req2email(req);
    req.body.date_created = new Date().toISOString();
    req.body.date_updated = req.body.date_created;
    req.body.user_email = user_email;
    // remove trailing comma from req.body.machine_ids if present
    req.body.machine_ids = req.body.machine_ids.replace(/(,)*$/, "");

    const sequence = sequenceSchema.parse(req.body);
    const serverResp = insertDBItem("sequences", sequence);
    console.log(serverResp);
    return renderSuccess(`Added sequence "${sequence.name}"`, res);
  } catch (err) {
    next(err);
  }
});

app.post("/update-workout/:id", (req, res, next) => {
  try {
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
    const machine_id = newWorkout.machine_id;
    const serverResp = updateDBItem("workouts", newWorkout);
    res.setHeader("HX-Trigger", "workout-modified-machine-id-" + machine_id);
    res.send(serverResp);
  } catch (err) {
    next(err);
  }
});

app.post("/update-machine", (req, res, next) => {
  try {
    const user_email = req2email(req);
    const machine_id = req.body.id;
    req.body.user_email = user_email;
    const newMachine = machineSchema.parse(req.body);
    newMachine.id = machine_id;
    const serverResp = updateDBItem("machines", newMachine);
    res.send(serverResp);
  } catch (err) {
    next(err);
  }
});

app.post("/delete-workout", (req, res, next) => {
  try {
    const user_email = req2email(req);
    const workout_id = req?.query?.id;
    const serverResp = deleteWorkout(workout_id, user_email);
    const machine_id = serverResp.machine_id;
    res.setHeader("HX-Trigger", "workout-modified-machine-id-" + machine_id);
    res.send(serverResp);
  } catch (err) {
    next(err);
  }
});

app.post("/delete-machine", (req, res, next) => {
  try {
    const user_email = req2email(req);
    const machine_id = req?.query?.id;
    const serverResp = deleteMachine(machine_id, user_email);
    res.send(serverResp);
  } catch (err) {
    next(err);
  }
});

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
    layout: "page",
    theme: getUserTheme(user_email),
    user: req.oidc.user,
    items: getMachines(user_email),
    endpoint: "machine",
    columns,
  });
});

app.get("/admin", (req, res) => {
  res.render("admin", { layout: "page", theme: getUserTheme(req2email(req)) });
});

app.get("/graph", (req, res) => {
  res.render("graph", { layout: "page", theme: getUserTheme(req2email(req)) });
});

app.get("/sequence-delete-buttons", (req, res) => {
  const user_email = req2email(req);
  const sequences = getSequences(user_email);
  if (sequences.length === 0) {
    return res.send("no sequences added yet");
  }
  const buttons = sequences.map((s) => {
    return a(
      {
        class: "btn btn-primary",
        "hx-delete": `/delete-sequence?id=${s.id}`,
        "hx-confirm": `Are you sure you want to delete sequence ${s.name} with ids ${s.machine_ids}?`,
      },
      s.name + " delete!",
    );
  });
  res.send(buttons.join(""));
});

app.delete("/delete-sequence", (req, res, next) => {
  try {
    const user_email = req2email(req);
    const sequence_id = req?.query?.id;
    const serverResp = deleteSequence(sequence_id, user_email);
    return renderSuccess(serverResp, res);
  } catch (err) {
    next(err);
  }
});

app.get("/machine-links", (req, res) => {
  const user_email = req2email(req);
  const sequences = getSequences(user_email);
  let nameHrefs = [];
  nameHrefs.push({
    href: "/?machine_ids=all",
    name: "All Machines",
    class: "btn btn-accent",
  });
  for (const s of sequences) {
    const href = `/?machine_ids=${s.machine_ids}`;
    nameHrefs.push({ href, name: s.name, class: "btn btn-accent" });
  }
  const machines = getMachines(user_email);
  for (const m of machines) {
    const href = `/?machine_ids=${m.id}`;
    nameHrefs.push({ href, name: m.name });
  }
  res.send(
    nameHrefs
      .map((m) =>
        a(
          { href: m.href },
          button({ class: (m.class || "btn btn-primary") + " m-1" }, m.name),
        ),
      )
      .join(""),
  );
});

app.get("/theme-update-links", (req, res) => {
  const user_theme = getUserTheme(req2email(req));
  const themeLinks = themes
    .map((t) => {
      return a(
        { href: `/update-theme?theme=${t}` },
        button(
          {
            class:
              user_theme == t
                ? "btn btn-accent text-4xl px-2"
                : "btn btn-primary",
          },
          t,
        ),
      );
    })
    .join("");
  res.send(themeLinks);
});

app.get("/update-theme", (req, res) => {
  const user_email = req2email(req);
  const theme = req.query?.theme;
  if (!themes.includes(theme)) {
    return res.send(`Invalid theme "${theme}"`);
  }
  updateUserTheme(user_email, theme);
  res.redirect(req.get("referer"));
});

app.get("/toast", (req, res) => {
  const msg = req.query?.msg || req.body?.msg;
  // res.setHeader("HX-Retarget", ".toast-container");
  res.render("toast", { msg });
});

app.get("/", (req, res) => {
  const user_email = req2email(req);
  initUser(user_email);
  let machine_ids = req.query?.machine_ids?.split(",") || [];
  if (machine_ids.length === 0 || machine_ids.includes("all")) {
    machine_ids = getMachines(user_email)
      .map((i) => i.id)
      .join(",");
    res.redirect("/?machine_ids=" + machine_ids);
  }
  res.render("index", {
    layout: "page",
    user: req.oidc.user,
    theme: getUserTheme(user_email),
    machine_ids,
  });
});

app.use((err, _, res, __) => {
  // error handling middleware
  const errText = err?.issues || err.message;
  console.error(err);
  log("error caught!\n" + JSON.stringify(errText));
  res.setHeader("HX-Retarget", ".toast-container");
  res.setHeader("HX-Reswap", "innerHTML");
  return res.render("toast", { msg: errText });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
