const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// Route for /campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

// Route for /campgrounds/new
router.get('/new', isLoggedIn,(req, res) => {
    res.render('campgrounds/new');
})

// Post route for /campgrounds
// Redirect back to /campgrounds/:id after post
router.post('/', isLoggedIn,validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new expressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        // Set user id
        campground.author = req.user._id;
        await campground.save();
        req.flash('success','Successfully made a new campground');
        res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for /campgrounds/:id
// Populate review
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground);
    // Call flash if campground not found
    // Redirect to campgrounds page
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}))

// Route for /campgrounds/:id/edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // Call flash if campground not found
    // Redirect to campgrounds page
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}))

// Route for update campground 
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    req.flash('success','Successfully update a campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Route for delete campground 
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted a campground');
    res.redirect(`/campgrounds`)
}))

module.exports = router;