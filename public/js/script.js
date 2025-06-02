let timers = [];
let intervals = [];
let buttonStates = [];
let columnToggle = 0;
let idCounter = 0;
let classList = [];

// Post absence data to backend
const postData = data => {
    const body = JSON.stringify(data);
    return fetch('/timestamp', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body
    })
    .then(response => response.json());
};

// Post class list to backend (if needed)
const postClassList = data => {
    return fetch('/viewAbsences', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        redirect: 'follow',
        referrer: 'no-referrer'
    })
    .then(response => response.json());
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load students from file and add to UI
function loadStudentsFromFile() {
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            let names = String(reader.result);
            classList = names.split("\n").map(name => name.trim()).filter(Boolean);
            for (let i = 0; i < classList.length; i++) {
                addStudent(classList[i]);
            }
        },
        false,
    );

    if (file) {
        reader.readAsText(file);
    }
}

// Add a student row and timer to the table
function addStudent(name) {
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
        <h1> ${name} </h1> 
      </div>
      <div class="time" id="time${idCounter}">
        <span class="hr">00</span>:<span class="min">00</span>:<span class="sec">00</span>:<span class="count">00</span>
      </div>
      <button class="button-timer" id="start${idCounter}">Start</button>
    `;

    timerFunc(idCounter);
    idCounter++;
    columnToggle++;
}

// Timer logic for each student
function timerFunc(index) {
    let startBtn = document.getElementById('start' + index);
    let timeDiv = document.getElementById('time' + index);

    if (!startBtn) return; // Defensive: skip if button not found

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

            let studentName = classList[index];
            let absence = [];
            absence.push(studentName);
            let startTimestamp = new Date();
            let t = [
                startTimestamp.getDate(),
                startTimestamp.getMonth(),
                startTimestamp.getFullYear(),
                startTimestamp.getHours(),
                startTimestamp.getMinutes(),
                startTimestamp.getSeconds()
            ];
            absence.push(t);
            startBtn.absenceData = absence; // store start data on the button

        } else if (buttonStates[index] === 1) {
            timers[index] = false;
            clearInterval(intervals[index]);
            startBtn.textContent = 'Reset';
            buttonStates[index] = 2;

            // collecting timestamp data to send to server side
            let stopTimestamp = new Date();
            let t2 = [
                stopTimestamp.getDate(),
                stopTimestamp.getMonth(),
                stopTimestamp.getFullYear(),
                stopTimestamp.getHours(),
                stopTimestamp.getMinutes(),
                stopTimestamp.getSeconds()
            ];
            let absence = startBtn.absenceData || [];
            absence.push(t2);
            console.log(absence);
            postData({ data: absence })
                .then(json => {
                    console.log(json);
                })
                .catch(e => console.log(e));
            startBtn.absenceData = null;
        } else if (buttonStates[index] === 2) {
            timers[index] = false;
            clearInterval(intervals[index]);
            resetTimer(index);
            startBtn.textContent = 'Start';
            buttonStates[index] = 0;
        }
    });
}

// Stopwatch logic for timer
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

// Update timer display
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

// Reset timer display
function resetTimer(index) {
    updateDisplay(index, 0, 0, 0, 0);
}

// For scrolling to the Learn More section
document.addEventListener('DOMContentLoaded', function () {
    const learnMoreButton = document.getElementById('learn-more-button');
    const learnMoreSection = document.getElementById('learn-more-section');

    if (learnMoreButton && learnMoreSection) {
        learnMoreButton.addEventListener('click', function (event) {
            event.preventDefault();
            learnMoreSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// For retaining the student list for every profile (upload and refresh)
async function viewStudents() {
    const fileInput = document.querySelector('input[type=file]');
    const file = fileInput.files[0];
    if (!file) return;

    const text = await file.text();
    const names = text.split('\n').map(name => name.trim()).filter(Boolean);

    await fetch('/upload-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: names })
    });

    // Refresh the page to see updated list in correct layout
    window.location.reload();
}

// If students are rendered by EJS, attach timerFunc to each button
document.addEventListener('DOMContentLoaded', function () {
    // If you have a classListData script tag, use it to set classList
    const classListData = document.getElementById('classListData');
    if (classListData) {
        classList = JSON.parse(classListData.textContent);
    }

    const buttons = document.querySelectorAll('.button-timer');
    buttons.forEach((btn, i) => {
        timerFunc(i);
    });
});