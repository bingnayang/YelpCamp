const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./schema.js');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const Review = require('./models/review');

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

// JOI Validation Middleware Function for Campground
const validateCampground = (req,res,next) =>{
    const { error } = campgroundSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }else{
        next();
    }
}

// JOI Validation Middleware Function for Review
const validateReview = (req,res,next) =>{
    const { error } = reviewSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }else{
        next();
    }
}

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
app.post('/campgrounds',validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new expressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for /campgrounds/:id
// Populate review
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    console.log(campground)
    res.render('campgrounds/show', {campground});
}))

// Route for /campgrounds/:id/edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

// Route for update campground 
app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
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

// Route for post review
app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Express Error class error handler
app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message){
        err.message = "Something went wrong";
    }
    res.status(statusCode).render('error',{err});
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})