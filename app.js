require("dotenv").config();
const express = require("express");
const path = require("path");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const User = require("./models/listings"); // Ensure this is your correct model
const Message = require("./models/Message"); // Import the Message model

// Passport configuration
require("./config/passport-config");

const app = express();

// Connect to MongoDB
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("Database URL is not defined in environment variables.");
  process.exit(1); // Exit the process if the DB URL is missing
}

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Database connection error:", err));

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Session and Passport initialization
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global middleware for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

// Authentication routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

// Chat page
app.get("/chat", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error_msg", "Please log in to view this page.");
    return res.redirect("/login");
  }

  try {
    const messages = await Message.find()
      .populate("user")
      .sort({ timestamp: 1 })
      .exec();
    res.render("chat", { messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.render("chat", { messages: [] });
  }
});

app.post("/chat", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error_msg", "You need to log in first!");
    return res.redirect("/login");
  }

  const { text } = req.body;
  const message = new Message({
    text,
    timestamp: new Date(),
    user: req.user._id,
  });
  message
    .save()
    .then(() => {
      req.flash("success_msg", "Message sent");
      res.redirect("/chat");
    })
    .catch((err) => {
      req.flash("error_msg", "Error sending message");
      res.redirect("/chat");
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
