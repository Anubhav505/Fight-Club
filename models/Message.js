const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
