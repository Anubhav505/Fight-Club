const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "User" }, // Ensure this matches the User model
});

module.exports = mongoose.model("Message", messageSchema);
