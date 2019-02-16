var express = require("express");
var Post = require("../models/post");
var router = express.Router();
var multer = require("multer");

//using multer to upload a single image
//declaring the destination and name of file
var dateOfPost = Date.now().toString();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images');
    },
    filename: function (req, file, cb) {
      cb(null, dateOfPost + '_' + file.originalname);
    }
  });
var upload = multer({ storage: storage });


//share route
router.get("/paylas.ejs",isLoggedIn,function(req,res){
    res.render("paylas.ejs");
});


//processes the share request
/* gets the info from paylas form and creates a new post
then saves the post and pushes the post id into the current user's userPosts array */
router.post("/paylas",upload.single('image'),function(req,res){
    var newPost = new Post({
        tripImage: dateOfPost + '_' + req.file.originalname,
        tripType: req.body.type,
        tripCountry: req.body.country,
        tripCity: req.body.city,
        tripDate: req.body.startdate,
        tripDuration: req.body.duration,
        tripSummary: req.body.summary,
        tripArticle: req.body.article
    });

    newPost.save(function(err,newPost){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            User.updateOne({username:req.user.username},{$push:{userPosts: newPost._id}},function(err,res){});
            console.log("added new post to the db,post's unique id: "+newPost._id);
            res.redirect("/");
        }
    });
});

router.get("/blogs/:blogId", function(req,res){
    Post.findById(req.params.blogId,function(err,foundBlog){
        if(err){
            console.log("-------------ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------FOUND BLOGS-------------");
            console.log(foundBlog);
            res.render("blog.ejs",{foundBlog:foundBlog});
        }
    });
});

//middleware func. that controls if a user is authenticated
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/giris.ejs");
}

module.exports = router;