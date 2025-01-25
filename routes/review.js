const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const customError=require("../utils/customError.js");
const Review=require("../models/review.js");
// const {reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const{validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controller/review.js");




//add a review to a list
//Review Post route 
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

//exporting router to app.js
module.exports=router;