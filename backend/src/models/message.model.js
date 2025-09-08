const  mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "chat", required: true },
  role: { type: String, enum: ['user', 'model'],}
}, { timestamps: true });

const Message = mongoose.model("message", messageSchema);

module.exports = Message;