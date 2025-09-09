// controllers/message.controller.js
const messageModel = require("../models/message.model");


// ✅ Get all messages of a chat
async function getMessages(req, res) {
  const { id } = req.params; // chatId
  const user = req.user;

  if (!id) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  try {
    const messages = await messageModel
      .find({ chat: id })
      .sort({ createdAt: 1 }); // oldest → newest

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

module.exports = { getMessages};
