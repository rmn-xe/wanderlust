const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl}= require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");


const userController=require("../controller/user.js");


//signup form
router.get("/signup",userController.renderSignupForm);

//signup 
router.post("/signup",wrapAsync(userController.signup));


//login form
router.get("/login",userController.renderLoginForm);

//authenticate using passport;
router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login);

//logout from session
router.get("/logout",userController.logout);

//exporting router to app.js
module.exports=router;