const mongoose = require('mongoose')
const { type } = require('os')

// schema
const testUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        }
    }
)

const Users = mongoose.model('users', testUserSchema)
module.exports = Users