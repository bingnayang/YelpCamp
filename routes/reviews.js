const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const expressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

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

// Route for post review
router.post('/',validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Successfully created new review');

    res.redirect(`/campgrounds/${campground._id}`);
}))

// Route for delete review
router.delete('/:reviewId', catchAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully delete a review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;