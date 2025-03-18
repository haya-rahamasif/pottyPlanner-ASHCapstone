const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')

const Users = require('./models/users')

// intialize the application
const app = express()

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Routing path
app.get('/', (req, res) => {
    res.render('../views/index.ejs');
});

// Start the server
app.listen(3001, () => {
    console.log('Server started on port 3001')
})

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

mongoose
    .connect(dbURL)
    .then((result) => {
        console.log('Connected to MongoDB')
        app.listen(3000, () => {
            console.log('server started on port 3000')
        })
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err)
    })

app.get('/', (req, res) => {
    Users.find()
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.error(err)
        })
})

