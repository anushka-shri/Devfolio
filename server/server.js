const express = require('express');
const connectDB = require('./config/db.js');

const app = express();
connectDB();



app.get('/', (req, res) => {
    res.send('API running');
});

app.use('/api/users', require('./routes/API/users'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serving on port ${PORT}` ))