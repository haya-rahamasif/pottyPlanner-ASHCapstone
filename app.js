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
    const time = new Date(startTime);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    if (timeInMinutes >= 500 && timeInMinutes <= 585) return 1; // 8:20 - 9:45
    if (timeInMinutes >= 590 && timeInMinutes <= 665) return 2; // 9:50 - 11:05
    if (timeInMinutes >= 715 && timeInMinutes <= 790) return 3; // 11:55 - 13:10
    if (timeInMinutes >= 795 && timeInMinutes <= 870) return 4; // 13:15 - 14:30
    return null;
}

// Create a single mongoose connection
let mongoConnection = null;
async function getMongoConnection() {
    if (!mongoConnection) {
        mongoConnection = await mongoose.connect(dbURL);
    }
    return mongoConnection;
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

app.post('/timestamp', async (req, res) => {
    try {
        let time = req.body.data;
        console.log('Received timestamp:', time);
        let startTime = time[1];
        
        const period = checkWhichPeriod(startTime);
        if (!period) {
            return res.status(400).json({ error: 'Time is outside of valid periods' });
        }

        await getMongoConnection();
        const doc = await Student.findOne({ studentName: time[0] });
        
        if (!doc) {
            const entry = new Student({
                studentName: time[0],
                studentID: ++id,
                absenceP1: [],
                absenceP2: [],
                absenceP3: [],
                absenceP4: []
            });

            const absence = [time[1], time[2]];
            switch (period) {
                case 1: entry.absenceP1 = [absence]; break;
                case 2: entry.absenceP2 = [absence]; break;
                case 3: entry.absenceP3 = [absence]; break;
                case 4: entry.absenceP4 = [absence]; break;
            }

            await entry.save();
            res.json({ status: 'saved' });
        } else {
            const absence = [time[1], time[2]];
            const updateField = {};
            switch (period) {
                case 1: updateField.absenceP1 = absence; break;
                case 2: updateField.absenceP2 = absence; break;
                case 3: updateField.absenceP3 = absence; break;
                case 4: updateField.absenceP4 = absence; break;
            }

            await Student.updateOne(
                { studentName: time[0] },
                { $push: updateField }
            );
            res.json({ status: 'updated' });
        }
    } catch (err) {
        console.error('Error in /timestamp:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// New endpoint to retrieve all timestamps for a student
app.get('/timestamps/:studentName', async (req, res) => {
    const studentName = decodeURIComponent(req.params.studentName);
    try {
        await mongoose.connect(dbURL);
        const student = await Student.findOne({ studentName });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Combine all absence arrays
        const timestamps = [
            ...(student.absenceP1 || []),
            ...(student.absenceP2 || []),
            ...(student.absenceP3 || []),
            ...(student.absenceP4 || [])
        ].map(absence => ({
            startTime: absence[0],
            endTime: absence[1],
            duration: Math.floor((new Date(absence[1]) - new Date(absence[0])) / 60000) // Duration in minutes
        }));

        // Sort by startTime
        timestamps.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        res.json(timestamps);
    } catch (err) {
        console.error('Error fetching timestamps:', err);
        res.status(500).json({ error: 'Failed to fetch timestamps' });
    } finally {
        await mongoose.disconnect();
    }
});

// MongoDB URL connection
const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB';

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});








