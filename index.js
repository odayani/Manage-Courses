// Initialize express
const express = require("express");
const cors = require("cors");

const routers = require("./routes/routes");

// Define app
const app = express();

//  https://expressjs.com/en/starter/static-files.html - serve static files
app.use(express.static('client'))

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routers);
const port = 3001;

const server = app.listen(port, () => {
  console.log("listening on port:", port);
});
