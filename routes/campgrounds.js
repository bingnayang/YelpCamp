const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const multer  = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage})

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// Route for /campgrounds
// Post route for /campgrounds, Redirect back to /campgrounds/:id after post
router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn,validateCampground, catchAsync(campgrounds.createCampground))
    .post(upload.array('image'), (req, res, next) =>{
        console.log(req.body, req.files)
        res.send("It Worked");
    })

// Route for /campgrounds/new
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// Route for /campgrounds/:id and Populate review
// Route for update campground 
// Route for delete campground 
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))    
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// Route for /campgrounds/:id/edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;