const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);

app.post("/clicked", (_, res) => {
  res.send(html`<p>you clicked me</p>`);
});

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
