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
    let names = req.body.data
    console.log('in view absence route')
    console.log(names)

    try {
    await mongoose
    .connect(dbURL)
    .then((result) => {
        return new Promise((resolve, reject) => {
            let entries = []
            for (let i=0; i<names.length-1;i++) {
            let singleName = names[i]
            Student.find({studentName: singleName}) // finding info on each student
            .then((doc) => {
                entries.push(doc)
                console.log(entries)
            })
            }

            resolve(entries)
        })

    })

    const data = {message: entries}
    res.json(data)

    }
    catch (err) {
        console.log(`error: ${err}`)
    }
    

})


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
                absence = []
            }
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err)
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
