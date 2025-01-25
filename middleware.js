const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const {listingSchema}=require("./schema.js");
const customError=require("./utils/customError.js");
const {reviewSchema}=require("./schema.js");

//is logged in
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl; 
        req.flash("error","you must be logged-in to do changes!");
        return res.redirect("/login");
    }
    next();
}; 
//redirect to the next route with login or signup page
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id); 
    if(!res.locals.currUser._id.equals(listing.owner._id)){
        req.flash("error","you are not the owner of this listing");
        return  res.redirect(`/listings/${id}`);
    }
    next();
};
module.exports.isReviewAuthor=async(req,res,next)=>{
    let{id,reviewId}=req.params;
    let review=await Review.findById(reviewId); 
    if(!res.locals.currUser._id.equals(review.author._id)){
        req.flash("error","you are not the author of this review");
        return  res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new customError(400,error) 
    }else{
        next();
    }
};
//joi validation
module.exports.validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
    if(error){
        throw new customError(400,error);
    }else{
        next();
    }
}