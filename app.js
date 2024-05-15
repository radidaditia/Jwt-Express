const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./Routes/AuthRoute");
const todos = require("./Routes/routeTodos");

const app = express();
app.use(cors());

const PORT = 3000 || process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", router);

app.use("/api", todos);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
