const mongoose = require('mongoose')

async function connect() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Language_Course';
        await mongoose.connect(uri)
        console.log("Connected to DB Successfully!")
    } catch (err) {
        console.log("Connected to DB Failure!")
    }
}

module.exports = connect