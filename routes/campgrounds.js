const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// Route for /campgrounds
router.get('/', catchAsync(campgrounds.index))

// Route for /campgrounds/new
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// Post route for /campgrounds
// Redirect back to /campgrounds/:id after post
router.post('/', isLoggedIn,validateCampground, catchAsync(campgrounds.createCampground))

// Route for /campgrounds/:id
// Populate review
router.get('/:id', catchAsync(campgrounds.showCampground))

// Route for /campgrounds/:id/edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// Route for update campground 
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

// Route for delete campground 
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;