//Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
//npm i dotenv
if(process.env.NODE_ENV !="production"){
    require('dotenv').config()
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate");
const customError=require("./utils/customError.js");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const port=8080;

//passport:-id/password
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const dbUrl=process.env.ATLASDB_URL;

 
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
main()
    .then(()=>{
        console.log("connceted to DB");
    }).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
};

// root route
app.get("/",(req,res)=>{
    // console.dir(req.cookies);
    // console.dir(req.session);
    res.send("hi i am root");
});
app.use(cookieParser("secretcode"));
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET, 
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});
const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.use(session(sessionOption));
app.use(flash());
//to use passport first you need to use session 
//passport is used to authenticate and hash password 
app.use(passport.initialize()); 
app.use(passport.session());
//authenticated through local strategy using authnticate mehtod
passport.use(new LocalStrategy(User.authenticate()));
//serialize the user into session or store user data into session
passport.serializeUser(User.serializeUser());
//Deserialize the user into session of unstore user data into session
passport.deserializeUser(User.deserializeUser());

//flash 
//locals
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


//middle-ware routes

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
//error handler middleware
app.all("*",(req,res,next)=>{
    next(new customError(404,"page not found"));
})
app.use((err,req,res,next)=>{
    let{status=500,message="some error occured"}=err;
    res.status(status).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log(`listing through port ${port}`);
});