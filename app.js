import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

import Student from './models/students.js'

import path from 'path';


// Login
import session from 'express-session'
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from './models/User.js'

const __dirname = path.resolve();
let id = 0

//export default entries

// intialize the application
const app = express()
app.use(express.json())

// Initialize the application
const app = express();

dotenv.config()

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

mongoose.connect(dbURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());

// Create a single mongoose connection
let mongoConnection = null;
async function getMongoConnection() {
    if (!mongoConnection) {
        mongoConnection = await mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    return mongoConnection;
}

// Routing paths
//login
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURL }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  }))

app.use((req, res, next) => {
    res.locals.userId = req.session.userId || null
    next()
})

// Routing path to render main page (accessible by everyone)
app.get('/', (req, res) => {
    res.render('../public/views/index.ejs');
});

// Protect Routes for authenticated users only
app.get('/profiles', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('../public/views/profiles.ejs', {
    students: user.students || [],
    userId: req.session.userId
  });
});


app.get('/stats', isAuthenticated, (req, res) => {
    res.render('../public/views/stats.ejs');
});

app.get('/feedback', isAuthenticated, (req, res) => {
    res.render('../public/views/feedback.ejs');
});

app.get('/register', (req, res) => {
    res.render('../public/views/register.ejs', { error: null })
  })  
  

app.get('/login', (req, res) => {
    res.render('../public/views/login.ejs');
});

app.post('/viewAbsences', async (req, res) => {
    let names = req.body.data;
    console.log('in view absence route');
    console.log(names);

    try {
        await mongoose.connect(dbURL);

        // Wait for all find() queries to finish
        const entries = await Promise.all(
            names.map(name => Student.find({ studentName: name }))
        );

        res.json({ message: entries });

    } catch (err) {
        console.log(`error: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
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

app.post('/timestamp', (req, res) => {
    // creates a instance of the student schema to make a new field (row of data) to add to the database
    let time = req.body.data

    mongoose 
    .connect(dbURL) // connects to database
    .then((result) => {
        console.log('Connected to MongoDB', `now looking for ${time[0]}`)
        Student.find({studentName: time[0]}) // finds all documents (columns) in the collection (table) and returns them. usually you can also specify a filter of some sort to only return specific data
        .then((doc) => { // doc is the result that is returned from the .find() method
                let startTime = time[1]
                let endTime = time[2]
                // storing timestamps as Date Objects
                let eTimestamp2 = new Date (endTime[2], endTime[1], endTime[0], endTime[3], endTime[4], endTime[5])
                let eTimestamp1 = new Date (startTime[2], startTime[1], startTime[0], startTime[3], startTime[4], startTime[5])
                let absence = [eTimestamp1, eTimestamp2]
                console.log(time[0], absence)
            if (String(doc).length == 0) {
                console.log("student not existing in db")
                let entry = new Student ({
                    studentName: time[0],
                    studentID: id,
                    absenceP1:[],
                    absenceP2:[],
                    absenceP3:[],
                    absenceP4:[]
                })
                /*let sTimestamp = new Date (`${time[1][0]}`)
                let eTimestamp = dont delete, gonna change data upload format*/
                
                id++
                switch(checkWhichPeriod(startTime)) {
                    case 1:
                        entry.absenceP1 = [absence]
                        break
                    case 2:
                        entry.absenceP2 = [absence]
                        break
                    case 3:
                        entry.absenceP3 = [absence]
                        break
                    case 4:
                        entry.absenceP4 = [absence]
                        break
                }
                entry 
                    .save()
                    .then((doc) => {
                        console.log('student saved')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                absence = []
            } else {
                console.log(`updating ${time[0]}'s profile`)
                switch(checkWhichPeriod(startTime)) {
                    case 1:
                        Student.updateOne({studentName: time[0]}, {$push: {absenceP2: absence}}, {new: true})
                        .then((doc) => {console.log(doc)})
                        .catch((err) => {
                            console.log(err)
                        })
                        console.log(`added absence to ${time[0]}'s profile in p1`)
                        break
                    case 2:
                        Student.updateOne({studentName: time[0]}, {$push: {absenceP2: absence}}, {new: true})
                        .then((doc) => {console.log(doc)})
                        .catch((err) => {
                            console.log(err)
                        })
                        console.log(`added absence to ${time[0]}'s profile in p2`)
                        break
                    case 3:
                        Student.updateOne({studentName: time[0]}, {$push: {absenceP2: absence}}, {new: true})
                        .then((doc) => {console.log(doc)})
                        .catch((err) => {
                            console.log(err)
                        })
                        console.log(`added absence to ${time[0]}'s profile in p3`)
                        break
                    case 4:
                        Student.updateOne({studentName: time[0]}, {$push: {absenceP2: absence}}, {new: true})
                        .then((doc) => {console.log(doc)})
                        .catch((err) => {
                            console.log(err)
                        })
                        console.log(`added absence to ${time[0]}'s profile in p4`)
                        break
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
const PORT = process.env.PORT || 9000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});








app.use(express.urlencoded({ extended: true }))

app.post('/register', async (req, res) => {
  const { email, password } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.render('../public/views/register.ejs', { error: 'Email already in use' })
    }

    const newUser = new User({ email, password })

    await newUser.save()
    res.redirect('/login')
  } catch (err) {
    console.error('Registration error:', err)
    res.render('../public/views/register.ejs', { error: 'Something went wrong. Try again.' })
  }
})

// Login helper
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next()
    res.redirect('/login')
  }

// Add Register + Login POST Routes

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.render('../public/views/login.ejs', { error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.render('../public/views/login.ejs', { error: 'Invalid credentials' })

    req.session.userId = user._id
    res.redirect('/profiles')
  } catch (err) {
    console.error(err)
    res.render('../public/views/login.ejs', { error: 'Login failed' })
  }
})

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

// Protect Routes

app.get('/profiles', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('../public/views/profiles.ejs', {
    students: user.students || [],
    userId: req.session.userId
  });
});

  
  app.get('/stats', isAuthenticated, (req, res) => {
    res.render('../public/views/stats.ejs');
  });
  
  app.get('/feedback', isAuthenticated, (req, res) => {
    res.render('../public/views/feedback.ejs');
  });


app.post('/upload-students', isAuthenticated, async (req, res) => {
  const { students } = req.body; // Array of names

  try {
    const user = await User.findById(req.session.userId);
    user.students = students;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving students:', err);
    res.status(500).json({ success: false, message: 'Failed to save students' });
  }
});


