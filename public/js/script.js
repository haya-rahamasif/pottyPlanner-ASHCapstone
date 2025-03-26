let timers = [];
let intervals = [];
let buttonStates = [];
let columnToggle = 0;
let idCounter = 4; 

function addEventListeners(index) {
    let startBtn = document.getElementById('start' + index);
    let timeDiv = document.getElementById('time' + index);

    if (!timers[index]) {
        timers[index] = false;
        buttonStates[index] = 0;
        intervals[index] = null;
    }

    startBtn.addEventListener('click', function () {
        if (buttonStates[index] === 0) {
            timers[index] = true;
            stopWatch(index);
            startBtn.textContent = 'Stop';
            buttonStates[index] = 1;
        } else if (buttonStates[index] === 1) {
            timers[index] = false;
            clearInterval(intervals[index]);
            startBtn.textContent = 'Reset';
            buttonStates[index] = 2;
        } else if (buttonStates[index] === 2) {
            timers[index] = false;
            clearInterval(intervals[index]);
            resetTimer(index);
            startBtn.textContent = 'Start';
            buttonStates[index] = 0;
        }
    });
}

function stopWatch(index) {
    if (timers[index]) {
        let hrElement = document.getElementById('time' + index).querySelector('.hr');
        let minElement = document.getElementById('time' + index).querySelector('.min');
        let secElement = document.getElementById('time' + index).querySelector('.sec');
        let countElement = document.getElementById('time' + index).querySelector('.count');

        let hour = parseInt(hrElement.textContent);
        let minute = parseInt(minElement.textContent);
        let second = parseInt(secElement.textContent);
        let count = parseInt(countElement.textContent);

        count++;
        if (count == 100) {
            second++;
            count = 0;
        }
        if (second == 60) {
            minute++;
            second = 0;
        }
        if (minute == 60) {
            hour++;
            minute = 0;
            second = 0;
        }
        updateDisplay(index, hour, minute, second, count);
        intervals[index] = setTimeout(function () {
            stopWatch(index);
        }, 10);
    }
}

function updateDisplay(index, hour, minute, second, count) {
    let hrElement = document.getElementById('time' + index).querySelector('.hr');
    let minElement = document.getElementById('time' + index).querySelector('.min');
    let secElement = document.getElementById('time' + index).querySelector('.sec');
    let countElement = document.getElementById('time' + index).querySelector('.count');

    let hrString = hour < 10 ? "0" + hour : hour;
    let minString = minute < 10 ? "0" + minute : minute;
    let secString = second < 10 ? "0" + second : second;
    let countString = count < 10 ? "0" + count : count;

    hrElement.textContent = hrString;
    minElement.textContent = minString;
    secElement.textContent = secString;
    countElement.textContent = countString;
}

function resetTimer(index) {
    updateDisplay(index, 0, 0, 0, 0);
}

document.addEventListener('DOMContentLoaded', function () {
    for(let i = 0; i < 4; i++){
        addEventListeners(i);
    }

    document.getElementById('addStudent').addEventListener('click', function () {
        let table = document.querySelector('.StudentsTable');
        let newRow;
        let newCell;

        if (columnToggle % 2 === 0) {
            newRow = table.insertRow();
            newCell = newRow.insertCell();
        } else {
            newRow = table.rows[table.rows.length - 1];
            newCell = newRow.insertCell();
        }

        newCell.innerHTML = `
          <div class="box-images">
            <img src="/images/soccer.webp">
          </div>
          <div class="container">
            <h1> New Student </h1> 
          </div>
          <div class="time" id="time${idCounter}">
            <span class="hr">00</span>:<span class="min">00</span>:<span class="sec">00</span>:<span class="count">00</span>
          </div>
          <button class="button-timer" id="start${idCounter}">Start</button>
        `;

        addEventListeners(idCounter);
        idCounter++;
        columnToggle++;
    });
});