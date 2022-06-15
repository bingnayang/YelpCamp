const { campgroundSchema, reviewSchema } = require('./schema');
const expressError = require('./utils/ExpressError');
const Campground = require('./models/campground');

// Middleware for loggedIn
module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error','You must be signed in')
        return res.redirect('/login');
    }
    next();
}

// JOI Validation Middleware Function for Campground
module.exports.validateCampground = (req,res,next) =>{
    const { error } = campgroundSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }else{
        next();
    }
}

// Middleware for author validation
module.exports.isAuthor = async(req,res,next) =>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// JOI Validation Middleware Function for Review
module.exports.validateReview = (req,res,next) =>{
    const { error } = reviewSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }else{
        next();
    }
}