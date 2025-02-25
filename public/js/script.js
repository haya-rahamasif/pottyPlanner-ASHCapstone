console.log("js loaded!")
console.log("js loaded!");
const ret = document.getElementById("timer");
const startBtn = document.querySelector("#start-timer");
const stopBtn = document.querySelector("#stop-timer");
const resetBtn = document.querySelector("#reset-timer");
let counter = 0;
let interval;

function stop() {
  clearInterval(interval);
  startBtn.disabled = false;
  stopBtn.classList.remove("active");
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
  startBtn.classList.add("active");
  stopBtn.classList.remove("active");
  resetBtn.classList.remove("active");
  interval = setInterval(function() {
    ret.innerHTML = convertSec(counter++); // timer start counting here...
  }, 1000);
}

function reset() {
  startBtn.disabled = false;
  counter = 0; // Reset the counter to zero
  ret.innerHTML = convertSec(counter);
  resetBtn.classList.add("active");
  startBtn.classList.remove("active");
  stopBtn.classList.remove("active");
}