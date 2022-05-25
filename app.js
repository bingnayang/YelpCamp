const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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

app.engine('ejs', ejsMate)
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}))// Request body
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

// Route for /campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

// Route for /campgrounds/new
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post route for /campgrounds
// Redirect back to /campgrounds/:id after post
app.post('/campgrounds', catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for /campgrounds/:id
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
}))

// Route for /campgrounds/:id/edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

// Route for update campground 
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for delete campground 
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
}))

// Error Handle
app.use((err, req, res, next) => {
    res.send('Something went wrong');
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})