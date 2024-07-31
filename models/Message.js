const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the message schema
const messageSchema = new Schema({
  text: {
    type: String,
    required: [true, "Message text is required"], // Adding a custom error message
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Message model
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
