const CookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.route')
const chatRoutes = require('./routes/chat.route');
const cors = require('cors');
const path = require('path');

app.use(cors({
  origin: ["http://localhost:5173", "https://chatgpt-clone-ruzm.onrender.com"],
  methods: ["GET", "POST"],
  credentials: true
}));


app.use(express.json());    

app.use(CookieParser());//

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

app.use(express.static(path.join(__dirname, '../public')));
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


module.exports = app;