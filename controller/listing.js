const Listing=require("../models/listing.js");
const axios = require('axios');
const mapToken=process.env.MAP_TOKEN;


//
module.exports.searchDestination=async(req,res)=>{
    const {destination} = req.query;
    let listings = await Listing.find({
        $or: [
            { country: { $regex: destination, $options: 'i' } },
            { location: { $regex: destination, $options: 'i' } }
        ]
    });
    if(listings.length>0){
        res.render("listings/index.ejs",{listings});
    }else{
        req.flash("error","There is no listing with this Destinaton");
        res.redirect("/listings");
    };
};

module.exports.indexByCategory=async(req,res)=>{
    const {q} = req.query;
    let listings=await Listing.find({category:q});
    if(listings.length>0){
        res.render("listings/index.ejs",{listings});
    }else{
        req.flash("error","There is no listing in this category");
        res.redirect("/listings");
    }
};
module.exports.index=async(req,res)=>{
    let listings=await Listing.find({});
    res.render("listings/index.ejs",{listings});

};
module.exports.renderNewForm=(req,res) => {
    res.render('listings/new.ejs');
};
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){ 
        req.flash("error","lisitng does not exist!");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs",{listing});
    }
};
module.exports.createListing = async (req, res, next) => {
    const forwardGeocode = async (address) => {
        try {
            const response = await axios.get(`https://api.geocodify.com/v2/geocode?api_key=${mapToken}&q=${address}&limit=1`);
            // Return the geometry object in GeoJSON format
            return response.data.response.features[0].geometry;
        } catch (error) {
            console.error("Geocoding error:", error);
            throw new Error("Failed to fetch geolocation data.");
        }
    };

    try {
        // Fetch the GeoJSON geometry from forwardGeocode
        const geometry = await forwardGeocode(req.body.listing.location);

        // Extract image path and filename
        const url = req.file.path;
        const filename = req.file.filename;

        // Create a new listing
        const data = new Listing(req.body.listing);
        data.owner = req.user._id;
        data.image = { url, filename };

        // Assign the fetched geometry to data.geometry
        data.geometry = geometry;

        data.category=req.body.listing.category;

        // Save the listing to the database
        let savedListing=await data.save();
        console.log(savedListing);

        // Flash success message and redirect
        req.flash("success", "New listing has been added");
        res.redirect("/listings");
    } catch (error) {
        next(error); // Pass errors to the error handler middleware
    }
};
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    if(!list){ 
        req.flash("error","lisitng does not exist!");
        res.redirect("/listings");
    }else{
        let originalImageUrl=list.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
        res.render("listings/edit.ejs",{list,originalImageUrl});   
    }
};

module.exports.updateListing = async (req, res, next) => {
    const forwardGeocode = async (address) => {
        try {
            const response = await axios.get(`https://api.geocodify.com/v2/geocode?api_key=${mapToken}&q=${address}&limit=1`);
            // Return the geometry object in GeoJSON format
            return response.data.response.features[0].geometry;
        } catch (error) {
            console.error("Geocoding error:", error);
            throw new Error("Failed to fetch geolocation data.");
        }
    };

    try {
        const { id } = req.params;

        // Fetch the GeoJSON geometry if location is updated
        let geometry = null;
        if (req.body.listing && req.body.listing.location) {
            geometry = await forwardGeocode(req.body.listing.location);
        }

        // Update the listing with new data
        const updatedData = {
            ...req.body.listing,
        };

        if (geometry) {
            updatedData.geometry = geometry; // Add updated geometry
        }
        updatedData.category=req.body.listing.category; //add updated category 

        const listing = await Listing.findByIdAndUpdate(id, updatedData);

        // Handle new image upload
        if (typeof req.file !== "undefined") {
            const url = req.file.path;
            const filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error); // Pass errors to the error handler middleware
    }
};

//update listing that is deleted
// module.exports.updateListing=async(req,res)=>{
//     let {id}=req.params;
//     //update from req body
//     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     //pushing new image url and file name and then explicitly saving it
//     if(typeof req.file !== "undefined"){
//         let url=req.file.path;
//         let filename=req.file.filename;
//         listing.image={url,filename};
//         await listing.save();
//     }
//     res.redirect(/listings/${id});
// };

//destroy
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing is deleted");
    res.redirect("/listings");
};