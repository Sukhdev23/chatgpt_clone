const express = require('express');
const chatController = require('../controllers/chat.controller');
const Authmiddleware = require('../middlewares/auth.middleware')
const Router = express.Router();
const { getMessages} = require('../controllers/message.controller');

Router.post('/',Authmiddleware,chatController.createChat);
Router.get('/', Authmiddleware, chatController.getChats);

Router.get("/:id/messages", Authmiddleware, getMessages);

module.exports = Router;