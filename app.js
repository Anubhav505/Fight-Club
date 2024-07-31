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

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
app.get("/", (req, res) => {
  res.redirect("/members/new");
});

app.get("/home", (req, res) => {
  res.render("users/home");
});

app.get("/members", async (req, res) => {
  const allMembers = await User.find();
  res.render("users/members", { allMembers });
});

app.get("/members/new", (req, res) => {
  res.render("users/new");
});

app.post("/members", async (req, res) => {
  const newUser = new User(req.body.user);
  await newUser.save();
  res.redirect("/members");
});

app.get("/members/:id", async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(id);
  res.render("users/show", { user });
});

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

app.delete("/members/:id", async (req, res) => {
  let { id } = req.params;
  await User.findByIdAndDelete(id);
  res.redirect("/members");
});

app.get("/chat", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).exec();
    res.render("users/chat", { messages }); // Pass messages to the template
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.render("users/chat", { messages: [] }); // Pass an empty array in case of error
  }
});

// Socket.io for chat
io.on("connection", (socket) => {
  console.log("A user connected");

  // Load previous messages
  (async () => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).exec();
      console.log("Loaded messages from DB:", messages); // Debugging
      socket.emit("load messages", messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  })();

  socket.on("chat message", async (msg) => {
    const message = new Message({ text: msg.text, timestamp: new Date() });
    try {
      await message.save();
      console.log("Saved message:", message); // Debugging
      io.emit("chat message", message); // Broadcast to all clients
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
