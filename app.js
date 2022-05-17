const express = require('express');
const path = require('path');
const Campground = require('./models/campground');

// Connect mongoose and check for error
const mongoose = require('mongoose');
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

// Route for /campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

// Route for /campgrounds/:id
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})