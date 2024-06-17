const express = require("express");
const app = express("");
const User = require("./models/listings");
const path = require("path");
engine = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fightclub");
}

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//1st page when open website
app.get("/", (req, res) => {
  res.redirect("/members/new");
});
//Root
app.get("/home", (req, res) => {
  res.render("users/home");
});
//Normal Web-Page
app.get("/rules", (req, res) => {
  res.render("users/rules");
});

//Index Rout
app.get("/members", async (req, res) => {
  const allMembers = await User.find();
  res.render("users/members", { allMembers });
});

//Create Rout
app.get("/members/new", (req, res) => {
  res.render("users/new");
});

app.post("/members", async (req, res) => {
  const newUser = new User(req.body.user);
  await newUser.save();
  res.redirect("/members");
});

//show Rout
app.get("/members/:id", async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(id);
  res.render("users/show", { user });
});

//Edit Rout
app.get("/members/:id/edit", async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(id);
  res.render("users/edit", { user });
});

app.patch("/members/:id", async (req, res) => {
  let { id } = req.params;
  await User.findByIdAndUpdate(id, { ...req.body.user });
  res.redirect(`/members/${id}`);
});

//Delete Rout
app.delete("/members/:id", async (req, res) => {
  let { id } = req.params;
  let deletedUser = await User.findByIdAndDelete(id);
  console.log(deletedUser);
  res.redirect("/members");
});

app.listen(8080, () => {
  console.log("server is listening to 8080");
});
