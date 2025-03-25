import theUsers from './models/users.js';
import express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import Users from './models/users.js';
import path from 'path';

const __dirname = path.resolve();
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

const dbURL = 'mongodb+srv://hayarahamasif:preach-immature-mouthful-smoky@pottyplannerdb.jg0o8.mongodb.net/?retryWrites=true&w=majority&appName=pottyPlannerDB'

mongoose
    .connect(dbURL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('could not connect to mongodb: ', err);
    });

app.get('/', async (req, res) => {
    try {
        const result = await Users.find();
        console.log(result);

        const user_1 = new theUsers({
            name: 'Vlad',
            email: 'vlad.calin@stu.ocsb.ca',
            password: 'asdf',
        });

   /*     await user_1.save();

        const firstUser = await Users.findOne({});
        console.log(firstUser); */

        res.render('../public/views/index.ejs', { users: result}); //Pass the data to the template
    } catch (err) {
        console.error(err);
        res.send('An error occurred.');
    }
});

app.get('/profiles', (req, res) => {
    res.render('../public/views/profiles.ejs');
});

app.listen(3001, () => {
    console.log('Server started on port 3001');
});