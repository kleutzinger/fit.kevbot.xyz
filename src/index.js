const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
// body parser
const bodyParser = require("body-parser");
// handle form data
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/machine-list", (_, res) => {
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
  ];
  res.send(
    html`${starterMachines.map((machine) => `<option>${machine}</option>`)}`,
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
