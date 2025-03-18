import mongoose from 'mongoose'
import type from 'os'

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

const theUsers = mongoose.model('users', testUserSchema)
export default theUsers