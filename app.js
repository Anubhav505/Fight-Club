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
  process.exit(1);
}

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Database connection error:", err));

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
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
app.get("/", (req, res) => res.redirect("/home"));

app.get("/home", (req, res) => res.render("home"));

// Authentication routes
app
  .route("/login")
  .get((req, res) => res.render("login"))
  .post(
    passport.authenticate("local", {
      successRedirect: "/home",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

// Registration routes
app
  .route("/register")
  .get((req, res) => res.render("register"))
  .post(async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash("error_msg", "Username already exists");
        return res.redirect("/register");
      }

      // Create a new user
      const newUser = new User({ username, password });
      await newUser.save();
      req.flash("success_msg", "Registration successful. You can now log in.");
      res.redirect("/login");
    } catch (err) {
      console.error("Error registering user:", err);
      req.flash("error_msg", "An error occurred during registration");
      res.redirect("/register");
    }
  });

// Chat page
app
  .route("/chat")
  .get(async (req, res) => {
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
  })
  .post(async (req, res) => {
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

    try {
      await message.save();
      req.flash("success_msg", "Message sent");
      res.redirect("/chat");
    } catch (err) {
      req.flash("error_msg", "Error sending message");
      res.redirect("/chat");
    }
  });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
