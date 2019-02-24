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

//Routes requiring
var indexRoutes = require("./routes/indexRoutes");
var postRoutes = require("./routes/postRoutes");
var userRoutes = require("./routes/userRoutes");

//MongoDB server connection
mongoose.connect("mongodb://frknn:05452143188Xx@tripsharecluster-shard-00-00-0knnd.mongodb.net:27017,tripsharecluster-shard-00-01-0knnd.mongodb.net:27017,tripsharecluster-shard-00-02-0knnd.mongodb.net:27017/test?ssl=true&replicaSet=tripShareCluster-shard-0&authSource=admin&retryWrites=true",{useNewUrlParser:true});

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

//Routes using
app.use(indexRoutes);
app.use(postRoutes);
app.use(userRoutes);

//page not found
app.get("*", function(req, res)
{
    res.send("Sayfa Bulunamadı!");
});

//creating server
// var server = app.listen(5000,function()
// {
//     console.log(`Server is up at port ${server.address().port}.`);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});