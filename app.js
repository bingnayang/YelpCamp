const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./schema.js');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');


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

// Use campgrounds routes
app.use('/campgrounds',campgrounds);


app.get('/', (req, res) => {
    res.render('home')
})

// Route for post review
app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// Route for delete review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
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