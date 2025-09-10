const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateVector, genarateContent } = require("../service/ai.service"); // fixed spelling
const MessageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");
const chatModel = require("../models/chat.model");

function initsocketserver(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://chatgpt-clone-ruzm.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // 🔐 Middleware auth
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      if (!cookies.token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket Auth Error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // 🟢 Connection
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user.email);

    socket.on("ai-message", async (rawData) => {
      try {
        const data =
          typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        console.log("📩 Parsed Message:", data);

        // User message + vector parallel
        const [message, vectors] = await Promise.all([
          MessageModel.create({
            content: data.content,
            user: socket.user._id,
            chat: data.chat,
            role: "user",
          }),
          generateVector(data.content),
        ]);

        // Memory fetch + store
        const [memory] = await Promise.all([
          queryMemory(vectors, 5, {
            user: socket.user._id.toString(),
            chat: data.chat,
          }),
          createMemory(vectors, message._id.toString(), {
            user: socket.user._id.toString(),
            chat: data.chat,
            text: message.content,
          }),
        ]);

        // Chat history
        const chatHistory = await MessageModel.find({ chat: data.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        const stm = chatHistory.reverse().map((item) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text:
                  `"these are the previous chat use them and generate a response"` +
                  memory.map((mem) => `\n- ${mem.metadata.text}`).join(""),
              },
            ],
          },
        ];

        // AI response
        const response = await genarateContent([...ltm, ...stm]);
        console.log("🤖 AI Response:", response);

        // Save AI message
        const [responseMessage, responseVectors] = await Promise.all([
          MessageModel.create({
            content: response,
            user: socket.user._id,
            chat: data.chat,
            role: "model",
          }),
          generateVector(response),
        ]);

        await createMemory(responseVectors, responseMessage._id.toString(), {
          user: socket.user._id.toString(),
          chat: data.chat,
          text: responseMessage.content,
        });

        // Emit back to client
        socket.emit("ai-response", { content: response, chat: data.chat });
      } catch (err) {
        console.error("AI Message Error:", err.message);
        socket.emit("ai-error", { error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

module.exports = initsocketserver;
