const User=require("../models/user.js");
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};
module.exports.signup=async(req,res)=>{
    try{
        let{username,email,password}=req.body;
        let newUser=new User({
            email,username
        });
        //here we save with register
        let registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err)
            }
            req.flash("success","wellcome to WanderLust");
            res.redirect("/listings");
        })
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
        return;
    }
};
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};
module.exports.login=async(req,res)=>{
    req.flash("success","logged in succesfully");
    if(res.locals.redirectUrl){
        res.redirect(res.locals.redirectUrl);
        return;
    }
    res.redirect('/listings');
};
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
         if(err){
            return next(err); 
         }
         req.flash("success","you are logged out");
         res.redirect("/listings");
    })

};