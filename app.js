require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/listings"); // Ensure this is your correct model
const Message = require("./models/Message"); // Import the Message model
const path = require("path");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("Database URL is not defined in environment variables.");
  process.exit(1); // Exit the process if the DB URL is missing
}

// Connect to MongoDB
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Database connection error:", err));

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Added middleware for JSON requests
app.use(methodOverride("_method"));

// Routes
app.get("/", (req, res) => {
  res.redirect("/members/new");
});

app.get("/home", (req, res) => {
  res.render("users/home");
});

app.get("/members", async (req, res) => {
  try {
    const allMembers = await User.find();
    res.render("users/members", { allMembers });
  } catch (err) {
    console.error("Error fetching members:", err);
    res.render("users/members", { allMembers: [] });
  }
});

app.get("/members/new", (req, res) => {
  res.render("users/new");
});

app.post("/members", async (req, res) => {
  try {
    const newUser = new User(req.body.user);
    await newUser.save();
    res.redirect("/members");
  } catch (err) {
    console.error("Error creating new member:", err);
    res.redirect("/members/new");
  }
});

app.get("/members/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let user = await User.findById(id);
    res.render("users/show", { user });
  } catch (err) {
    console.error("Error fetching member:", err);
    res.redirect("/members");
  }
});

app.get("/members/:id/edit", async (req, res) => {
  try {
    let { id } = req.params;
    let user = await User.findById(id);
    res.render("users/edit", { user });
  } catch (err) {
    console.error("Error fetching member for edit:", err);
    res.redirect("/members");
  }
});

app.patch("/members/:id", async (req, res) => {
  try {
    let { id } = req.params;
    await User.findByIdAndUpdate(id, { ...req.body.user });
    res.redirect(`/members/${id}`);
  } catch (err) {
    console.error("Error updating member:", err);
    res.redirect(`/members/${id}/edit`);
  }
});

app.delete("/members/:id", async (req, res) => {
  try {
    let { id } = req.params;
    await User.findByIdAndDelete(id);
    res.redirect("/members");
  } catch (err) {
    console.error("Error deleting member:", err);
    res.redirect("/members");
  }
});

app.get("/chat", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).exec();
    res.render("users/chat", { messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.render("users/chat", { messages: [] });
  }
});

// Socket.io for chat
io.on("connection", (socket) => {
  console.log("A user connected");

  // Load previous messages
  (async () => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).exec();
      socket.emit("load messages", messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  })();

  socket.on("chat message", async (msg) => {
    const message = new Message({ text: msg.text, timestamp: new Date() });
    try {
      await message.save();
      io.emit("chat message", message); // Broadcast to all clients
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
