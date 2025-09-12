require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');  
const initsocketserver = require('./src/sockets/socket.server');
const http = require('http');




const server = http.createServer(app); // HTTP + Express server
initsocketserver(server); // Socket.io attach karo

const PORT = process.env.PORT || 3000;
connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
