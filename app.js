const express = require("express");
const app = express("");
const User = require("./models/listing.js");
const path = require("path");
engine = require('ejs-mate');
methodOverride = require('method-override')
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fightclub');
};

app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.redirect("/users/new");
});

app.get("/home", (req, res) => {
    res.render("users/home.ejs");
});

//Index Rout
app.get("/users", async (req, res) => {
    const allUsers = await User.find({});
    res.render("users/members.ejs", { allUsers });
});

//New Rout
app.get("/users/new", (req, res) => {
    res.render("users/signin.ejs");
});

//Show Rout
// app.get("/users/:id", async (req, res) => {
//     let { id } = req.params;
//     const user = await User.findById(id);
//     res.render("users/show.ejs", { user });
// });

//Create Rout
app.post("/users", async (req, res) => {
    const newUser = new User(req.body.user);
    await newUser.save();
    res.redirect("/users");
});

//Edit Rout
app.get("/users/:id/edit", async (req,res) => {
    let {id} = req.params;
    const user = await User.findById(id);
    res.render("users/edit.ejs", { user })
})

//Update Route
app.put("/users/:id", async (req, res) => {
    let { id } = req.params;
    await User.findByIdAndUpdate(id, { ...req.body.user });
    res.redirect("/users");
});

app.get("/rules", (req,res) => {
    res.render("users/rules.ejs");
});

app.listen("8080", (req, res) => {
    console.log("Server is listening to port 8080");
});