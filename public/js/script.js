let timers = [];
let intervals = [];
let buttonStates = [];
let columnToggle = 0;
let idCounter = 0; 
let absence = []
let classList = Array;

const postData = data => {
  const body = JSON.stringify(data);
  return fetch('/timestamp', {
      method: 'POST', // GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, same-origin
      cache: 'no-cache', // default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, same-origin, omit
      headers: {
          'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, follow, error
      referrer: 'no-referrer', // no-referrer, client
      body
  })
      .then(response => response.json()) // parses JSON response into native JavaScript objects
  }

  const postClassList = data => {
    const body = JSON.stringify(data);
    return fetch('/viewAbsences', {
        method: 'POST', // GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, same-origin
        cache: 'no-cache', // default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, follow, error
        referrer: 'no-referrer', // no-referrer, client
        body
    })
        .then(response => response.json()) // parses JSON response into native JavaScript objects
    }

function viewStudentAbsences() {
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        // this will then display a text file
        let names = String(reader.result)
        let classList = names.split("\n")
        postClassList({data: classList})
                .then(json => {
                    console.log(json);
                })
                .catch(e => console.log(e));
      },
      false,
    );
  
    if (file) {
      reader.readAsText(file);
    }

}

function timerFunc(index) {
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
            let studentName = classList[index]
            absence.push(studentName)
            let startTimestamp = new Date()
            let t = [startTimestamp.getDate(), startTimestamp.getMonth(), startTimestamp.getFullYear(), startTimestamp.getHours(), startTimestamp.getMinutes(), startTimestamp.getSeconds()]
            absence.push(t)
        

        } else if (buttonStates[index] === 1) {
            timers[index] = false;
            clearInterval(intervals[index]);
            startBtn.textContent = 'Reset';
            buttonStates[index] = 2;

            // collecting timestamp data to send to server side
            let stopTimestamp = new Date()
            let t2 = [stopTimestamp.getDate(), stopTimestamp.getMonth(), stopTimestamp.getFullYear(), stopTimestamp.getHours(), stopTimestamp.getMinutes(), stopTimestamp.getSeconds()]
            absence.push(t2)
            console.log(absence)
            postData({data: absence})
                .then(json => {
                    console.log(json);
                })
                .catch(e => console.log(e));
            absence = []
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

function viewStudents() {
    console.log("displaying students")
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();
  
    reader.addEventListener(
      "load",
      () => {
        // this will then display a text file
        let names = String(reader.result)
        classList = names.split("\n")
        for (let i=0; i < classList.length; i++) {
            addStudent(classList[i])
        }
      },
      false,
    );
  
    if (file) {
      reader.readAsText(file);
    }
  }

document.addEventListener('DOMContentLoaded', function () {
    for(let i = 0; i < 4; i++){
        timerFunc(i);
    }
});

//Scrolling to the Learn More Section
document.addEventListener('DOMContentLoaded', function() {
    const learnMoreButton = document.getElementById('learn-more-button');
    const learnMoreSection = document.getElementById('learn-more-section');

    learnMoreButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default button behavior
        learnMoreSection.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly
    });
});



