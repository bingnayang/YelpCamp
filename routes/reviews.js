const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn} = require('../middleware');

// Route for post review
router.post('/',isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
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