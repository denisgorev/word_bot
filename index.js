const express = require("express");
require('dotenv').config()
const wordBot = require("./controller/bot-controllers");

// const { call } = require("./google-engine/google-api");
const app = express();
const PORT = process.env.PORT || 3000 // Specify the desired port number

// Define your routes here
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

wordBot.wordBot()
// call()


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
