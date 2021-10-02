require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRound = 10;
const app = express();

console.log(process.env.API_KEY);

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
}); 


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


const User = new mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.post("/login", (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, (err, result)=>{
                    if (result === true) {
                        res.render("secrets");
                    } else {
                        console.log("Wrong Password");
                    }
                });
            } else {
                console.log("Wrong email");
            }
        }
    });
});

app.post("/register", (req, res)=>{
    bcrypt.hash(req.body.password, saltRound, (err, hash)=>{
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
    
        newUser.save((err)=>{
            if(!err){
                res.render("secrets");
            } else {
                console.log("Registration Failed");
            }
        });
    });

});

app.listen(process.env.PORT || 3000, (req, res)=>{
    console.log("Listening on port 3000")
});