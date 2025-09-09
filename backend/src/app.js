const CookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.route')
const chatRoutes = require('./routes/chat.route');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());    

app.use(CookieParser());//

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // Vite
  // res.sendFile(path.join(__dirname, "build", "index.html")); // CRA
});

module.exports = app;