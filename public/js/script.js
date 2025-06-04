let timers = [];
let intervals = [];
let buttonStates = [];
let columnToggle = 0;
let idCounter = 0;
let classList = [];
let globalInterval = null; // Single interval for all timers


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

const postFeedback = data => {
    return fetch('/feedbackData', {
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
            localStorage.setItem('classList', JSON.stringify(classList));
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
        <h1>${name}</h1>
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

// Update timer display based on elapsed time
function updateDisplay(index, elapsed) {
    let hrElement = document.getElementById('time' + index)?.querySelector('.hr');
    let minElement = document.getElementById('time' + index)?.querySelector('.min');
    let secElement = document.getElementById('time' + index)?.querySelector('.sec');
    let countElement = document.getElementById('time' + index)?.querySelector('.count');

    if (!hrElement || !minElement || !secElement || !countElement) return;

    const hour = Math.floor(elapsed / (1000 * 60 * 60));
    const minute = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const second = Math.floor((elapsed % (1000 * 60)) / 1000);
    const count = Math.floor((elapsed % 1000) / 10);

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
    updateDisplay(index, 0);
}

// Update all running timers
function updateAllTimers() {
    timers.forEach((isRunning, index) => {
        if (isRunning) {
            const timerState = JSON.parse(localStorage.getItem(`timer_${index}`)) || {};
            if (timerState.isRunning && timerState.startTime) {
                const elapsed = Date.now() - timerState.startTime;
                updateDisplay(index, elapsed);
            }
        }
    });
}

// Timer logic for each student
function timerFunc(index) {
    let startBtn = document.getElementById('start' + index);
    if (!startBtn) return;

    // Initialize timer state
    if (!timers[index]) {
        timers[index] = false;
        buttonStates[index] = 0;
        intervals[index] = null;
    }

    // Restore timer state from localStorage
    const timerState = JSON.parse(localStorage.getItem(`timer_${index}`)) || {};
    if (timerState.isRunning && timerState.startTime) {
        timers[index] = true;
        buttonStates[index] = 1;
        startBtn.textContent = 'Stop';
        startBtn.absenceData = timerState.absenceData;
        // Start global timer update if not already running
        if (!globalInterval) {
            globalInterval = setInterval(updateAllTimers, 10);
        }
    }

    startBtn.addEventListener('click', function () {
        if (buttonStates[index] === 0) {
            timers[index] = true;
            buttonStates[index] = 1;
            startBtn.textContent = 'Stop';

            let studentName = classList[index];
            let absence = [studentName];
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
            startBtn.absenceData = absence;

            // Save timer state to localStorage
            localStorage.setItem(`timer_${index}`, JSON.stringify({
                isRunning: true,
                startTime: startTimestamp.getTime(),
                absenceData: absence,
                studentName: studentName
            }));

            // Start global timer update if not already running
            if (!globalInterval) {
                globalInterval = setInterval(updateAllTimers, 10);
            }

        } else if (buttonStates[index] === 1) {
            timers[index] = false;
            buttonStates[index] = 2;
            startBtn.textContent = 'Reset';

            // Post absence data to backend
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
            postData({ data: absence })
                .then(json => {
                    console.log(json);
                })
                .catch(e => console.log(e));

            // Clear timer state from localStorage
            localStorage.removeItem(`timer_${index}`);
            startBtn.absenceData = null;

            // Stop global interval if no timers are running
            if (!timers.some(t => t)) {
                clearInterval(globalInterval);
                globalInterval = null;
            }

        } else if (buttonStates[index] === 2) {
            timers[index] = false;
            buttonStates[index] = 0;
            resetTimer(index);
            startBtn.textContent = 'Start';

            // Ensure localStorage is cleared
            localStorage.removeItem(`timer_${index}`);
        }
    });
}

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

    localStorage.setItem('classList', JSON.stringify(names));
    window.location.reload();
}

// Initialize timers and class list on page load
document.addEventListener('DOMContentLoaded', function () {
    // Restore classList from localStorage or EJS
    const classListData = document.getElementById('classListData');
    if (classListData) {
        classList = JSON.parse(classListData.textContent);
        localStorage.setItem('classList', JSON.stringify(classList));
    } else {
        const storedClassList = localStorage.getItem('classList');
        if (storedClassList) {
            classList = JSON.parse(storedClassList);
            if (document.querySelector('.StudentsTable').rows.length === 0) {
                idCounter = 0;
                columnToggle = 0;
                classList.forEach(name => addStudent(name));
            }
        }
    }

    // Attach timerFunc to each button and start global timer update if needed
    const buttons = document.querySelectorAll('.button-timer');
    buttons.forEach((btn, i) => {
        timerFunc(i);
    });

    // Start global timer update if any timers are running
    if (timers.some(t => t) && !globalInterval) {
        globalInterval = setInterval(updateAllTimers, 10);
    }
});


function submitFeedback(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const feedback = document.getElementById('feedback').value;

    alert(`Thank you, ${name}, for your feedback!\n\n"${feedback}"`);
    document.querySelector('form').reset();
    const content = [name, feedback]

    postFeedback({ data: content })
                .then(json => {
                    console.log(json);
                })
                .catch(e => console.log(e));

  }

  function goBack() {
    window.location.href = '/';
  }

// Smooth scroll for Learn More button
document.addEventListener('DOMContentLoaded', function () {
    // ...existing code...

    const learnMoreBtn = document.getElementById('learn-more-button');
    const learnMoreSection = document.getElementById('learn-more-section');
    if (learnMoreBtn && learnMoreSection) {
        learnMoreBtn.addEventListener('click', function (e) {
            e.preventDefault();
            learnMoreSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});