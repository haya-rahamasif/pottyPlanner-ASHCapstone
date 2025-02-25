console.log("js loaded!")
const ret = document.getElementById("timer");
const startBtn = document.querySelector("#start-timer");
let counter = 0;
let interval;
const express = require('express'); //test
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); //test
function stop() {
  clearInterval(interval);
  startBtn.disabled = false;
}

function convertSec(cnt) {
  let sec = cnt % 60;
  let min = Math.floor(cnt / 60);
  if (sec < 10) {
    if (min < 10) {
      return "0" + min + ":0" + sec;
    } else {
      return min + ":0" + sec;
    }
  } else if ((min < 10) && (sec >= 10)) {
    return "0" + min + ":" + sec;
  } else {
    return min + ":" + sec;
  }
}

function start() {
  startBtn.disabled = true;
  interval = setInterval(function() {
    ret.innerHTML = convertSec(counter++); // timer start counting here...
  }, 1000);
}
function reset() {
  startBtn.disabled = false;
  counter = 0; // Reset the counter to zero
  ret.innerHTML = convertSec(counter);
}