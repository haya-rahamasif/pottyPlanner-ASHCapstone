import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

import Student from './models/students.js'
import path from 'path';
const __dirname = path.resolve();

// intialize the application
const app = express()

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routing path
app.get('/', (req, res) => {
    res.render('../views/index.ejs');
});

app.get('/timestamp', (req, res) => {
    res.render("timestamp route")
})

app.use(express.json())
app.post('/timestamp', (req, res) => {
    // creates a instance of the student schema to make a new field (row of data) to add to the database
    let time = req.body.data
    console.log(time)
    let startTime = time[0]

    if (startTime[3] >= 8 && startTime[4] >=20) {
        if (startTime[3] <= 9 && startTime[4] <= 45){
            console.log('p1 absence')
        }
    } else if (startTime[3] >= 9 && startTime[4] <= 55){
        if (startTime[4] >=5 && startTime[3] <= 11){
            console.log('p2 absence')
        }
    } else if (startTime[3] >= 11 && startTime[4] <= 55){
        if (startTime[4] <=10 && startTime[3] <= 1){
            console.log('p3 absence')
        }
    } else if (startTime[3] >= 1 && startTime[4] <= 15){
        if (startTime[3] >=2 && startTime[4] <= 30){
            console.log('p4 absence')
        }
    }

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
    })

    mongoose 
    .connect(dbURL) // connects to database
    .then((result) => {
        console.log('Connected to MongoDB')
        Student.find({studentID: '0924'}) // finds all documents (columns) in the collection (table) and returns them. usually you can also specify a filter of some sort to only return specific data
        .then((doc) => { // doc is the result that is returned from the .find() method
            doc.
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err)
    })*/
    
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
