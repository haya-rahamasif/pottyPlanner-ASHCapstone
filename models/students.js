import mongoose from 'mongoose'


// schema
const studentDataSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: true,
        },
        studentID: {
            type: String,
            required: true,
        },
        absenceP1: {
            type: Array,
            required: true,
        },
        absenceP2: {
            type: Array,
            required: true,
        },
        absenceP3: {
            type: Array,
            required: true,
        },
        absenceP4: {
            type: Array,
            required: true,
        }
    }
)


const Student = mongoose.model('Student', studentDataSchema)
export default Student