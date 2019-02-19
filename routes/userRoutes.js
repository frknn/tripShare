var express = require("express");
var passport = require("passport");
var Post = require("../models/post");
var User = require("../models/user");
var router = express.Router();

//sign up route
router.get("/kaydol.ejs",function(res,res){
    res.render("kaydol.ejs");
});

//processes the sign up request with passport package
router.post("/kaydol",function(req,res){
    User.register(new User({username: req.body.username}), req.body.password,function(err,user){
        if (err) {
            console.log(err);
            return res.render("kaydol.ejs");
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/");
            });
        }
    });
});

//sign in route
router.get("/giris.ejs",function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/");
    }
    else{
        res.render("giris.ejs");
    }
});

//admin page
router.get("/adminpage",function(req,res){
    if(req.isAuthenticated() && req.user.isAdmin == true){
        Post.find({},function(err,foundPosts){
            if(err){
                console.log("-------------ERROR-------------");
                console.log(err);
            }else{
                console.log("-------------ALL BLOGS-------------");
                console.log(foundPosts);
                res.render("admin.ejs",{foundPosts:foundPosts});
            }
        });
    }else{
        res.redirect("/");
    }
});

//admin approval
router.get("/onayla/:blogId",function(req,res){
    Post.findByIdAndUpdate(req.params.blogId,{$set:{"isConfirmed":true}},function(err){
        if(err){
            console.log("-------------ERROR-------------");
            console.log(err);
        }else{
            console.log("-------------BLOG ONAYLANDI-------------");
            res.redirect("/adminpage");
        }
    })
});

//processes the sign in request with passport.authenticate
//redirects homepage if it is successful
router.post("/giris", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/giris.ejs"
}),function(req,res){
});

//sign out route
router.get("/cikis",function(req,res){
    req.logout();
    res.redirect("/");
});

//middleware func. that controls if a user is authenticated
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/giris.ejs");
}

module.exports = router;