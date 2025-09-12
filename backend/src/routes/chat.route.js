const express = require('express');
const chatController = require('../controllers/chat.controller');
const Authmiddleware = require('../middlewares/auth.middleware')
const Router = express.Router();
const { getMessages} = require('../controllers/message.controller');

Router.post('/chats',Authmiddleware,chatController.createChat);
Router.get('/chats', Authmiddleware, chatController.getChats);

Router.get("/chats/:id/messages", Authmiddleware, getMessages);

module.exports = Router;