const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async (req, res) => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify:false
        });
        console.log('DB connected');

    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;  