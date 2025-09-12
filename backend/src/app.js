
const authRoutes = require('./routes/auth.route')
const chatRoutes = require('./routes/chat.route');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");

app.use(cors({
  origin: ["http://localhost:5173", "https://chatgpt-clone-ruzm.onrender.com"],
  methods: ["GET", "POST"],
  credentials: true
}));


app.use(express.json());    

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

app.use(express.static(path.join(__dirname, '../public')));
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


module.exports = app;