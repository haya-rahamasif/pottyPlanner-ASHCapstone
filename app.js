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
app.listen(3001, () => {
    console.log('Server started on port 3001')
})

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

// creates a instance of the user schema to make a new field (row of data) to add to the database
let entry1 = new User ({
    name: 'sam',
    email: 'def@hij.com',
    password: 'hello world'
})
/*
entry1 
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
        console.log('Connected to MongoDB')
        User.find() // finds all documents (columns) in the collection (table) and returns them. usually you can also specify a filter of some sort to only return specific data
        .then((doc) => { // doc is the result that is returned from the .find() method
            console.log(doc)
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err)
    })

app.get('/', (req, res) => { // this code will only run if it receives a web request from the client side
    User.find({name: "john smith"})
    .then((result) => {
        console.log(` result -> ${result}`)
    })
    .catch((err) => {
        console.error(err)
    })
})
