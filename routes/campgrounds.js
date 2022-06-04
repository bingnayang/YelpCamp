const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const expressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

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

// Route for /campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

// Route for /campgrounds/new
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

// Post route for /campgrounds
// Redirect back to /campgrounds/:id after post
router.post('/',validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new expressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for /campgrounds/:id
// Populate review
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    console.log(campground)
    res.render('campgrounds/show', {campground});
}))

// Route for /campgrounds/:id/edit
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

// Route for update campground 
router.put('/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for delete campground 
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
}))

module.exports = router;