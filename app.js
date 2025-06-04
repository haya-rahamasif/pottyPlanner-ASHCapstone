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

function checkWhichPeriod(startTime) {
    let time = new Date (`1/1/1999 ${startTime[3]}:${startTime[4]}:${startTime[5]}`)
    if (time > new Date ("1/1/1999 8:20:0") && new Date ("1/1/1999 9:45:00") > time) {
        return 1
    }
    if (time > new Date ("1/1/1999 9:50:0") && new Date ("1/1/1999 11:05:0") > time){
        return 2
    }
    if (time > new Date ("1/1/1999 11:55:0") && new Date ("1/1/1999 13:10:0") > time){
        return 3
    }
    if (time > new Date ("1/1/1999 13:15:0") && new Date ("1/1/1999 14:30:0") > time){
        return 4
    }
}

dotenv.config()

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

mongoose.connect(dbURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

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


app.get('/stats', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('../public/views/stats.ejs', {
      students: user.students || [],
      userId: req.session.userId
  });
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

app.post('/timestamp', (req, res) => {
    let time = req.body.data;
    if (!time[0] || typeof time[0] !== 'string') {
        return res.status(400).json({ error: 'Student name is required.' });
    }
    const normalizedName = time[0].trim();

    mongoose
    .connect(dbURL)
    .then(() => {
      console.log(`looking for ${normalizedName}`)
        Student.findOne({ studentName: normalizedName })
        .then(async (doc) => {
            let startTime = time[1]
            let endTime = time[2]
            let eTimestamp1 = new Date(startTime[2], startTime[1], startTime[0], startTime[3], startTime[4], startTime[5])
            let eTimestamp2 = new Date(endTime[2], endTime[1], endTime[0], endTime[3], endTime[4], endTime[5])
            let absence = [eTimestamp1, eTimestamp2]

            // Ignore if time is during lunch (11:05-11:55)
            const today = new Date(eTimestamp1)
            today.setHours(11, 5, 0, 0)
            const lunchEnd = new Date(eTimestamp1)
            lunchEnd.setHours(11, 55, 0, 0)
            if ((eTimestamp1 >= today && eTimestamp1 < lunchEnd) || (eTimestamp2 > today && eTimestamp2 <= lunchEnd)) {
                return res.json({ message: "Time during lunch, not recorded." })
            }

            let period = checkWhichPeriod(startTime)
            if (!period) return res.json({ message: "Not in a valid period." })

            if (!doc) {
              console.log(`student not found, creating new entry`)
                let entry = new Student({
                    studentName: normalizedName,
                    studentID: id++,
                    absenceP1: [],
                    absenceP2: [],
                    absenceP3: [],
                    absenceP4: []
                })
                switch (period) {
                    case 1: entry.absenceP1 = [absence]; break;
                    case 2: entry.absenceP2 = [absence]; break;
                    case 3: entry.absenceP3 = [absence]; break;
                    case 4: entry.absenceP4 = [absence]; break;
                }
                entry.save()
                    .then(() => res.json({ message: "Student created and absence saved." }))
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({ error: err.message })
                    })
            } else {
              console.log('student found, updating...')
                let update = {}
                switch (period) {
                    case 1: update = { $push: { absenceP1: absence } }; break;
                    case 2: update = { $push: { absenceP2: absence } }; break;
                    case 3: update = { $push: { absenceP3: absence } }; break;
                    case 4: update = { $push: { absenceP4: absence } }; break;
                }
                Student.updateOne({ studentName: normalizedName }, update)
                    .then(() => res.json({ message: "Absence added." }))
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({ error: err.message })
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err.message })
        })
    })
    .catch(err => {
        console.error('could not connect to mongodb: ', err)
        res.status(500).json({ error: err.message })
    })
})


// Start the server
const PORT = process.env.PORT || 9000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

//Register form

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


app.get('/getStudentStats', async (req, res) => {
    try {
        let studentName = req.query.studentName;
        if (!studentName || typeof studentName !== 'string') {
            return res.json({ periods: [0, 0, 0, 0] });
        }
        studentName = decodeURIComponent(studentName).trim();
        const student = await Student.findOne({ studentName });
        if (!student) {
            return res.json({ periods: [0, 0, 0, 0] });
        }

        // Helper to sum minutes for a period
        function sumMinutes(absences) {
            return (absences || []).reduce((sum, absence) => {
                if (!absence[0] || !absence[1]) return sum;
                const start = new Date(absence[0]);
                const end = new Date(absence[1]);
                // Only take data from that day not previous days
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today)
                tomorrow.setDate(today.getDate() + 1)
                if (start >= today && start < tomorrow) {
                  return sum + Math.max(0, (end - start) / 60000);
                }
                return sum;
            }, 0);
        }

        const periods = [
            sumMinutes(student.absenceP1),
            sumMinutes(student.absenceP2),
            sumMinutes(student.absenceP3),
            sumMinutes(student.absenceP4)
        ];

        res.json({ periods });
    } catch (err) {
        console.error('Error in /getStudentStats:', err);
        res.status(500).json({ error: 'Failed to fetch stats: ' + err.message });
    }
});
