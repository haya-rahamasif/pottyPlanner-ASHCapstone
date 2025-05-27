import express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import Student from './models/students.js';
import path from 'path';

const __dirname = path.resolve();

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
        mongoConnection = await mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
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
app.get('/getStudentStats', async (req, res) => {
    try {
        const studentName = decodeURIComponent(req.query.studentName || 'Unknown Student');
        await getMongoConnection();

        const student = await Student.findOne({ studentName });
        if (!student) {
            return res.json({ stats: [] }); // Or handle as you wish
        }

        // Combine absences from all periods
        const allAbsences = [
            ...(student.absenceP1 || []),
            ...(student.absenceP2 || []),
            ...(student.absenceP3 || []),
            ...(student.absenceP4 || [])
        ];

        // ...existing code...

        // Aggregate durations by date
        const dailyTotals = {};
        allAbsences.forEach(absence => {
            const startTime = new Date(absence[0]);
            const endTime = new Date(absence[1]);
            const durationMs = endTime - startTime;
            if (durationMs < 0) return; // Skip invalid durations

            // Get date in YYYY-MM-DD format
            const date = startTime.toISOString().split('T')[0];
            
            if (!dailyTotals[date]) {
                dailyTotals[date] = 0;
            }
            dailyTotals[date] += durationMs;
        });

        // Convert durations to minutes and format response
        const stats = Object.entries(dailyTotals).map(([date, totalMs]) => ({
            date,
            totalMinutes: Math.round(totalMs / 60000) // Convert to minutes
        }));

        res.json({ stats });
    } catch (err) {
        console.error('Error in /getStudentStats:', err);
        res.status(500).json({ error: 'Failed to fetch stats: ' + err.message });
    }
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

        // Defensive: Check for valid ISO strings and valid time array
        if (!Array.isArray(time) || time.length < 3 || !time[1] || !time[2]) {
            return res.status(400).json({ error: 'Invalid time data sent from client.' });
        }
        if (isNaN(Date.parse(time[1])) || isNaN(Date.parse(time[2]))) {
            return res.status(400).json({ error: 'Invalid date format.' });
        }

        const period = checkWhichPeriod(time[1]);
        console.log('Calculated period:', period, 'for startTime:', time[1]);
        if (!period) {
            return res.status(400).json({ error: 'Time is outside of valid periods' });
        }

        await getMongoConnection();

        // Ensure student exists (upsert), but do NOT $push in the same update as $setOnInsert
        const studentName = time[0];
        const absence = [time[1], time[2]];

        // Step 1: Ensure student exists
        await Student.updateOne(
            { studentName },
            {
                $setOnInsert: {
                    studentName,
                    studentID: Date.now(),
                    absenceP1: [],
                    absenceP2: [],
                    absenceP3: [],
                    absenceP4: []
                }
            },
            { upsert: true }
        );

        // Step 2: Push absence to the right period field (separate update to avoid conflict)
        let pushField = {};
        switch (period) {
            case 1: pushField = { absenceP1: absence }; break;
            case 2: pushField = { absenceP2: absence }; break;
            case 3: pushField = { absenceP3: absence }; break;
            case 4: pushField = { absenceP4: absence }; break;
        }

        await Student.updateOne(
            { studentName },
            { $push: pushField }
        );

        res.json({ status: 'updated' });

    } catch (err) {
        console.error('Error in /timestamp:', err);
        res.status(500).json({ error: 'Failed to process request: ' + err.message });
    }
});

// MongoDB URL connection
const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB';

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});








