const express = require("express");
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/home.ejs", (req, res) => {
    res.render("home.ejs")
});

app.get("/members.ejs", (req, res) => {
    res.render("members.ejs")
});

app.get("/user/:id/edit", (req, res) => {
    res.render("edit.ejs")
});

app.get("/rules.ejs", (req, res) => {
    res.render("rules.ejs")
});

app.get("/signin.ejs", (req, res) => {
    res.render("signin.ejs")
});

app.get("*", (req, res) => {
    res.send("This path is invalid")
});

app.listen("8080", () => {
    console.log("Server is listening to port 8080")
});