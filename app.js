const express = require('express');
const path = require('path');

// Connect mongoose and check for error
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"Connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'))

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})