const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');  // import message model

// ✅ Create Chat
async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const newChat = await chatModel.create({ 
      user: user.id,
      title,
      lastActivity: new Date()
    });

    res.status(201).json({ 
      message: 'Chat created successfully', 
      chat: {
        _id: newChat._id,
        user: newChat.user,
        title: newChat.title,
        lastActivity: newChat.lastActivity,
        messages: []   // return empty messages initially
      }
    });
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
}

// ✅ Get Chats with Messages
async function getChats(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    // 1. Fetch all chats of logged-in user
    const chats = await chatModel.find({ user: userId }).sort({ lastActivity: -1 });

    // 2. Fetch messages for each chat
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const messages = await messageModel
          .find({ chat: chat._id })
          .sort({ createdAt: 1 }); // oldest → newest
        return {
          ...chat.toObject(),
          messages
        };
      })
    );

    res.status(200).json(chatsWithMessages);
  } catch (error) {
    console.error("Get Chats Error:", error);
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
}

module.exports = {
  createChat,
  getChats
};
