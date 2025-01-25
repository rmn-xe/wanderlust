const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
// const {listingSchema}=require("../schema.js");
// const customError=require("../utils/customError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");
//require controller folder
const lisitngController=require("../controller/listing.js");

//library for handling multipart data and connecting it with backend
const multer  = require('multer')

//requiring  storage  form cloudConfig 
const {storage}=require("../cloudConfig.js");

//multer uploadting files to storage or cloud through cloudconfig
const upload = multer({storage});


//search by location or country
router.get("/search",lisitngController.searchDestination);

//index by category
router.get("/category",lisitngController.indexByCategory);
//index route
router.get("/",wrapAsync(lisitngController.index));
// new route
router.get('/new',isLoggedIn,lisitngController.renderNewForm);
//create new list
router.post("/",isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(lisitngController.createListing));
//show route
router.get("/:id",wrapAsync(lisitngController.showListing));
//edit listing
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(lisitngController.renderEditForm));

//update listing
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(lisitngController.updateListing));

//delete listing
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(lisitngController.destroyListing));



//exporting router to app.js
module.exports=router;