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

mongoose.connect("mongodb://localhost/expressUserDB",{useNewUrlParser:true});
app.use(bp.urlencoded({extended:true}));


app.use(require("express-session")({
    secret:"Bu bir express session uygulamasıdır.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
//Share current user info within all routes
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
});

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(exp.static("public"));

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/giris.ejs");
}

//Paylaş route
app.get("/paylas.ejs",isLoggedIn,function(req,res){
    res.render("paylas.ejs");
});

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
//Paylaşma isteği işleme
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

app.get("/rengarenk.ejs",isLoggedIn,function(req,res)
{
    res.render("rengarenk.ejs");
});

app.get("/dom.ejs",isLoggedIn,function(req,res)
{
    res.render("dom.ejs");
});



//Kaydol route
app.get("/kaydol.ejs",function(res,res){
    res.render("kaydol.ejs");
});

//Kayıt istedğini işle
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


//Giriş yapma route
app.get("/giris.ejs",function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/");
    }
    else{
        res.render("giris.ejs");
    }
});

//Giriş isteğini değerlendir
app.post("/giris", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/giris.ejs"
}),function(req,res){
});

//Çıkış yapma route
app.get("/cikis",function(req,res){
    req.logout();
    res.redirect("/");
});


app.get("/test/:birsey",function(req,res){
    var param1 = req.params.birsey;
    res.render("test.ejs",{param1});
});

app.get("*", function(req, res)
{
    res.send("Sayfa Bulunamadı Len!");
});

var server = app.listen(3000,function()
{
    console.log(`Server is up at port ${server.address().port}.`);
});