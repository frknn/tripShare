var express = require("express");
var Post = require("../models/post");
var router = express.Router();

//home page route
//finds the current posts and passes them into the anasayfa.ejs file
router.get("/",function(req,res)
{
    Post.find({},function(err,foundPosts){
        if(err){
            console.log("-------------ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------ALL BLOGS-------------");
            console.log(foundPosts);
            res.render("anasayfa.ejs",{foundPosts:foundPosts});
        }
    });
});

module.exports = router;