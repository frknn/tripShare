var exp = require('express');
var app = exp();
var bp = require("body-parser");
var mongoose = require("mongoose");
var User = require("./models/user");
var Post = require("./models/post");
var localStrategy = require("passport-local");
var passport = require("passport");
var passLocalMong = require("passport-local-mongoose");
var multer = require("multer");

//MongoDB server connection
mongoose.connect("mongodb://localhost/expressUserDB",{useNewUrlParser:true});

//body-parser boilerplate
app.use(bp.urlencoded({extended:true}));

//express-session boilerplate
app.use(require("express-session")({
    secret:"Bu bir express session uygulamasıdır.",
    resave:false,
    saveUninitialized:false
}));

//making public directory static
app.use(exp.static("public"));

//passport boilerplate
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Share current user info within all routes
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});

//middleware func. that controls if a user is authenticated
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/giris.ejs");
}

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

//home page route
//finds the current posts and passes them into the anasayfa.ejs file
app.get("/",function(req,res)
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

//a placeholder page for blog page
//will be removed when blog page is ready
app.get("/rengarenk.ejs",isLoggedIn,function(req,res)
{
    res.render("rengarenk.ejs");
});

//sign up route
app.get("/kaydol.ejs",function(res,res){
    res.render("kaydol.ejs");
});

//processes the sign up request with passport package
app.post("/kaydol",function(req,res){
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
app.get("/giris.ejs",function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/");
    }
    else{
        res.render("giris.ejs");
    }
});

//processes the sign in request with passport.authenticate
//redirects homepage if it is successful
app.post("/giris", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/giris.ejs"
}),function(req,res){
});

//sign out route
app.get("/cikis",function(req,res){
    req.logout();
    res.redirect("/");
});

//share route
app.get("/paylas.ejs",isLoggedIn,function(req,res){
    res.render("paylas.ejs");
});


//processes the share request
/* gets the info from paylas form and creates a new post
then saves the post and pushes the post id into the current user's userPosts array */
app.post("/paylas",upload.single('image'),function(req,res){
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

//page not found
app.get("*", function(req, res)
{
    res.send("Sayfa Bulunamadı!");
});

//creating server
var server = app.listen(3000,function()
{
    console.log(`Server is up at port ${server.address().port}.`);
});