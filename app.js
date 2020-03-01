//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// --encrypting
//const encrypt = require("mongoose-encryption");
//--hashing
//var md5 = require("md5");
// --bycrypt
//const bcrypt = require('bcrypt');
//const saltRounds = 10;
//--passport
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//console.log(process.env.ENVY_DORK);
//console.log(process.env.SECRET);
//console.log(process.env.LOGNAME);

app.use(session( {
    secret:"Nowisthetimefor",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

//const userSchema = new mongoose.Schema({
//  email: String,
//  password: String
//});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// encrypting
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// const  dork = new User({
//     email:"duck@davis.com",
//     password:"password"
// });

// dork.save();

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req,res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {
    User.register({username:req.body.username},req.body.password, function (err, user){
        if (err) {
            console.log(err);
            res.render("/register");
        } else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            })
        }
    });
});


app.post("/login", function (req, res) {
   const user = new User({
       username : req.body.username,
       password : req.body.password
   });

   req.logIn(user, function(err){
       if (err) {
           console.log(err);
       } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("secrets");
            })
       }
   })
});

app.listen(port, function () {
    console.log("Listening on port: " + port);
});
