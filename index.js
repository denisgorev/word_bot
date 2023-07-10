const express = require("express");
require('dotenv').config()
const wordBot = require("./controller/bot-controllers");
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 3000 // Specify the desired port number
const WAIT_INTERVAL = 840000 // 28 minutes
const TIMEOUT = 7200000 // 2 hours

let interval = 0;

// Define your routes here
app.get("/", (req, res) => {
  res.send("Hello, World!");
});


const wakeUp = async () => {
  try {
      await axios.get('https://word-bot.onrender.com')
  } catch (err) {
      console.log(err)
  }
};
const timeFinish = () => {
  clearInterval(interval);
  console.log('go to sleep');
}

interval = setInterval(wakeUp, WAIT_INTERVAL);
setTimeout(timeFinish, TIMEOUT);


try {
wordBot.wordBot()
} catch (err) {
    console.log(err);
    process.exit(1)
}
// call()


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
