import express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import Student from './models/students.js';
import path from 'path';

const __dirname = path.resolve();
let id = 0;

// Initialize the application
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());

// Function to check which period the time falls under
function checkWhichPeriod(startTime) {
    let time = new Date(`1/1/1999 ${startTime}`);
    if (time > new Date("1/1/1999 8:20:00") && time < new Date("1/1/1999 9:45:00")) {
        return 1;
    }
    if (time > new Date("1/1/1999 9:50:00") && time < new Date("1/1/1999 11:05:00")) {
        return 2;
    }
    if (time > new Date("1/1/1999 11:55:00") && time < new Date("1/1/1999 13:10:00")) {
        return 3;
    }
    if (time > new Date("1/1/1999 13:15:00") && time < new Date("1/1/1999 14:30:00")) {
        return 4;
    }
}

// Routing paths
app.get('/', (req, res) => {
    res.render('../public/views/index.ejs');
});

app.get('/profiles', (req, res) => {
    res.render('../public/views/profiles.ejs');
});

app.get('/stats', (req, res) => {
    res.render('../public/views/stats.ejs');
});

app.get('/login', (req, res) => {
    res.render('../public/views/login.ejs');
});

app.get('/feedback', (req, res) => {
    res.render('../public/views/feedback.ejs');
});

app.get('/moreStats', (req, res) => {
    const studentName = decodeURIComponent(req.query.studentName || 'Unknown Student');
    res.render('../public/views/moreStats.ejs', { studentName });
});

app.post('/viewAbsences', (req, res) => {
    let names = req.body.data;
    console.log('In view absence route:', names);
    res.json({ status: 'received' });
});

app.post('/timestamp', (req, res) => {
    let time = req.body.data;
    console.log('Received timestamp:', time);
    let startTime = time[1];

    mongoose
        .connect(dbURL)
        .then(() => {
            console.log(`Connected to MongoDB, now looking for ${time[0]}`);
            Student.find({ studentName: time[0] })
                .then((doc) => {
                    if (!doc.length) {
                        console.log("Student does not exist in DB");
                        let entry = new Student({
                            studentName: time[0],
                            studentID: ++id,
                            absenceP1: [],
                            absenceP2: [],
                            absenceP3: [],
                            absenceP4: []
                        });

                        let absence = [time[1], time[2]];
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
                            .then(() => {
                                console.log('Student saved');
                                res.json({ status: 'saved' });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({ error: 'Failed to save student' });
                            });
                    } else {
                        console.log(`Updating ${time[0]}'s profile`);
                        let absence = [time[1], time[2]];
                        let updateField = {};
                        switch (checkWhichPeriod(startTime)) {
                            case 1:
                                updateField.absenceP1 = absence;
                                break;
                            case 2:
                                updateField.absenceP2 = absence;
                                break;
                            case 3:
                                updateField.absenceP3 = absence;
                                break;
                            case 4:
                                updateField.absenceP4 = absence;
                                break;
                        }

                        Student.updateOne(
                            { studentName: time[0] },
                            { $push: updateField },
                            { new: true }
                        )
                            .then(() => {
                                console.log(`Added absence to ${time[0]}'s profile`);
                                res.json({ status: 'updated' });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({ error: 'Failed to update student' });
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: 'Database query failed' });
                });
        })
        .catch((err) => {
            console.error('Could not connect to MongoDB:', err);
            res.status(500).json({ error: 'Database connection failed' });
        });
});

// MongoDB URL connection
const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB';

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});








