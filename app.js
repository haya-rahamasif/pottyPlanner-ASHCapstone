import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

import Student from './models/students.js'
import path from 'path';

const __dirname = path.resolve();
let id = 0

// Initialize the application
const app = express()

// Function to check which period the time falls under
function checkWhichPeriod(startTime) {
    let time = new Date(`1/1/1999 ${startTime[3]}:${startTime[4]}:${startTime[5]}`);
    if (time > new Date("1/1/1999 8:20:0") && new Date("1/1/1999 9:45:00") > time) {
        return 1;
    }
    if (time > new Date("1/1/1999 9:50:0") && new Date("1/1/1999 11:05:0") > time) {
        return 2;
    }
    if (time > new Date("1/1/1999 11:55:0") && new Date("1/1/1999 13:10:0") > time) {
        return 3;
    }
    if (time > new Date("1/1/1999 13:15:0") && new Date("1/1/1999 14:30:0") > time) {
        return 4;
    }
}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routing path to render main page
app.get('/', (req, res) => {
    res.render('../public/views/index.ejs');
});

// Routing path to render profile page
app.get('/profiles', (req, res) => {
    res.render('../public/views/profiles.ejs');
});

// Routing path to render stats page
app.get('/stats', (req, res) => {
    res.render('../public/views/stats.ejs');
});

// Routing path to render login page
app.get('/login', (req, res) => {
    res.render('../public/views/login.ejs');
});

// Routing path to render feedback page
app.get('/feedback', (req, res) => {
    res.render('../public/views/feedback.ejs');
});

// Routing path to render moreStats page
app.get('/moreStats', (req, res) => {
    const studentName = req.query.studentName || 'Unknown Student';
    res.render('../public/views/moreStats.ejs', { studentName });
});


// POST route to view absences
app.post('/viewAbsences', (req, res) => {
    let names = req.body.data;
    console.log('In view absence route');
    console.log(names);
});

// Middleware to parse JSON body
app.use(express.json());

// POST route to save a timestamp (absence data)
app.post('/timestamp', (req, res) => {
    // Creates an instance of the student schema to add a new row of data to the database
    let time = req.body.data;
    console.log(time);
    let startTime = time[1];

    mongoose
        .connect(dbURL)  // Connects to the MongoDB database
        .then((result) => {
            console.log('Connected to MongoDB', `Now looking for ${time[0]}`);
            Student.find({ studentName: time[0] })  // Finds all documents for the student
                .then((doc) => {  // doc is the result returned from the .find() method
                    if (String(doc).length == 0) {
                        console.log("Student does not exist in DB");

                        let entry = new Student({
                            studentName: time[0],
                            studentID: id,
                            absenceP1: [],
                            absenceP2: [],
                            absenceP3: [],
                            absenceP4: []
                        });

                        let absence = [time[1], time[2]];
                        id++;

                        switch (checkWhichPeriod(startTime)) {
                            case 1:
                                entry.absenceP1 = [absence];
                                break;
                            case 2:
                                entry.absenceP2 = [absence];
                                break;
                            case 3:
                                entry.absenceP3 = [absence];
                                break;
                            case 4:
                                entry.absenceP4 = [absence];
                                break;
                        }

                        entry
                            .save()
                            .then((doc) => {
                                console.log('Student saved');
                            })
                            .catch((err) => {
                                console.log(err);
                            });

                        absence = [];
                    } else {
                        console.log(`Updating ${time[0]}'s profile`);

                        let absence = [time[1], time[2]];

                        switch (checkWhichPeriod(absence[1])) {
                            case 1:
                                Student.updateOne({ studentName: time[0] }, { $push: { absenceP1: absence } }, { new: true })
                                    .then((doc) => { console.log(doc); })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                console.log(`Added absence to ${time[0]}'s profile in P1`);
                                break;
                            case 2:
                                Student.updateOne({ studentName: time[0] }, { $push: { absenceP2: absence } }, { new: true })
                                    .then((doc) => { console.log(doc); })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                console.log(`Added absence to ${time[0]}'s profile in P2`);
                                break;
                            case 3:
                                Student.updateOne({ studentName: time[0] }, { $push: { absenceP3: absence } }, { new: true })
                                    .then((doc) => { console.log(doc); })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                console.log(`Added absence to ${time[0]}'s profile in P3`);
                                break;
                            case 4:
                                Student.updateOne({ studentName: time[0] }, { $push: { absenceP4: absence } }, { new: true })
                                    .then((doc) => { console.log(doc); })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                console.log(`Added absence to ${time[0]}'s profile in P4`);
                                break;
                        }

                        absence = [];
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.error('Could not connect to MongoDB:', err);
        });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

function openMoreStats(id) {
  const input = document.getElementById(`studentName${id}`);
  const studentName = encodeURIComponent(input.value);
  window.location.href = `/moreStats?studentName=${studentName}`;
}


// MongoDB URL connection
const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB';









