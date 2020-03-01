//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// encrypting
//const encrypt = require("mongoose-encryption");
//hashing
//var md5 = require("md5");
// bycrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

//const userSchema = new mongoose.Schema({
//  email: String,
//  password: String
//});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// encrypting
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

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

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save(function (err) {
            if (err) {
                console.log(err)
            } else {
                res.render("secrets");
            }
        });
    });
});


app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.render("secrets");
                    }
                });
                //if (foundUser.password === md5(password)) {
                //    res.render("secrets");
                //}
            }
        }
    })
});

app.listen(port, function () {
    console.log("Listening on port: " + port);
});
