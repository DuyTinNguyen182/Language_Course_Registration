const mongoose = require('mongoose')

async function connect() {
    try {
        const uri = 'mongodb://127.0.0.1:27017/Language_Course';
        await mongoose.connect(uri)
        console.log("Connected to DB Successfully!")
    } catch (err) {
        console.log("Connected to DB Failure!")
    }
}

module.exports = connect

// const mongoose = require('mongoose')

// async function connect() {
//     try {
//         // await mongoose.connect('mongodb://127.0.0.1:27017/Language_Course')
//         // await mongoose.connect('mongodb://mongo:27017/Language_Course')
//         await mongoose.connect('mongodb://host.docker.internal:27017/Language_Course')   
//         console.log("Connected to DB Successfully!")
//     } catch (err) {
//         console.log("Connected to DB Failure!")
//         console.log(err)
//     }
// }

// module.exports = connect