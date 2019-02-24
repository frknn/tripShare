var express = require("express");
var app = express();
var Post = require("../models/post");
var User = require("../models/user");
var router = express.Router();
var multer = require("multer");
var bp = require("body-parser");
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));
router.use(bp.urlencoded({extended:true}));

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
        tripArticle: req.body.content,
        ownerID: req.user._id,
        ownerMail: req.user.username
    });

    newPost.save(function(err,newPost){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            User.updateOne({username:req.user.username},{$push:{userPosts: newPost._id}},function(err,res){});
            console.log("added new post to the db, post's unique id: "+newPost._id);
            res.redirect("/");
        }
    });
});

//router that gets blog id and passed them into blog page
router.get("/blogs/:blogId", function(req,res){
    Post.findById(req.params.blogId,function(err,foundBlog){
        if(err){
            console.log("-------------ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------FOUND BLOGS-------------");
            console.log(foundBlog);
            res.render("blogs/blog.ejs",{foundBlog:foundBlog});
        }
    });
});

//deleting a post: pressing delete button sends this url and it finds the related post and deletes it
router.get("/delete/:deleteId",function(req,res){
    Post.findByIdAndDelete(req.params.deleteId,function(err){
        if(err){
            console.log("-------------DELETION ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------BLOG SILINDI-------------");
            res.redirect(`/users/${req.user._id}`);
        }
    });
});

//renders the post update page with that post's current values
router.get("/update/:postToBeUpdated", function(req,res){
    Post.findById(req.params.postToBeUpdated,function(err,foundBlog){
        if(err){
            console.log("-------------ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------FOUND BLOG-------------");
            console.log(foundBlog);
            res.render("update.ejs",{foundBlog:foundBlog});
        }
    });
});

//updating a post: pressing update button sends this url and it finds this post and updates with form values
//image and date are currently inactive
router.post("/updated/:updateReq",upload.none(),function(req,res){
    Post.findOneAndUpdate({_id:req.params.updateReq},
        {
            isConfirmed    : false,
            tripType       : req.body.type,
            tripCountry    : req.body.country,
            tripCity       : req.body.city,
            tripDuration   : req.body.duration,
            tripSummary    : req.body.summary,
            tripArticle    : req.body.content
        },
    function(err){
        if(err){
            console.log("-----------------GÜNCELLEMEDE HATA-------------------");
            console.log(err);
        }else{
            console.log("-----------------POST GÜNCELLENDİ-----------------------");
            res.redirect(`/users/${req.user._id}`);
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