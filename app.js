import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

import Student from './models/students.js'
import path from 'path';
const __dirname = path.resolve();
let id = 0

// intialize the application
const app = express()

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
    return 2 // REMOVE LINE AFTER TESTING!!
}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routing path to render main page
app.get('/', (req, res) => {
    res.render('../public/views/index.ejs');
});

// routing path to render profile page
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


app.get('/timestamp', (req, res) => {
    res.render("timestamp route")
})

app.use(express.json())
app.post('/timestamp', (req, res) => {
    // creates a instance of the student schema to make a new field (row of data) to add to the database
    let time = req.body.data
    console.log(time)
    let startTime = time[1]

    
    

 

    /*let entry = new Student ({
        studentName:"john smith",
        studentID:"0924",
        absenceP1:[time],
        absenceP2:["0"],
        absenceP3:["0"],
        absenceP4:["0"]
    })

    entry 
    .save()
    .then((doc) => {
        console.log(doc)
    })
    .catch((err) => {
        console.log(err)
    })*/

    mongoose 
    .connect(dbURL) // connects to database
    .then((result) => {
        console.log('Connected to MongoDB', `now looking for ${time[0]}`)
        Student.find({studentName: time[0]}) // finds all documents (columns) in the collection (table) and returns them. usually you can also specify a filter of some sort to only return specific data
        .then((doc) => { // doc is the result that is returned from the .find() method
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
                let absence = [time[1], time[2]]
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
                let absence = [time[1], time[2]]
                switch(checkWhichPeriod(absence[1])) {
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
app.listen(3001, () => {
    console.log('Server started on port 3001')
})

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'


/*
entry1 
    .save()
    .then((doc) => {
        console.log(doc)
    })
    .catch((err) => {
        console.log(err)
    })*/



app.get('/', (req, res) => { // this code will only run if it receives a web request from the client side
})
