import express from 'express'
import ejs from 'ejs'
import mongoose from 'mongoose'

import User from './models/users.js'
import path from 'path';
const __dirname = path.resolve();

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
app.listen(3000, () => {
    console.log('Server started on port 3000')
})

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

mongoose
    .connect(dbURL)
    .then((result) => {
        console.log('Connected to MongoDB')
        User.find()
    .then((result) => {
        console.log(` result -> ${result}`)
    })
    .catch((err) => {
        console.error(err)
    })
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err)
    })

app.get('/', (req, res) => {
    User.find({name: "john smith"})
    .then((result) => {
        console.log(` result -> ${result}`)
    })
    .catch((err) => {
        console.error(err)
    })
})