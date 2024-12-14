const express = require('express');
const router = express.Router();
const messagesController = require('../Controllers/MessagesController');
const authMiddleware = require('../MiddleWares/authMiddleware'); 



router.post('/createMessage', authMiddleware, messagesController.createMessage);


router.get('/messages/lang/:lang', authMiddleware, messagesController.getMessagesByLanguage);


router.get('/messages/:id', authMiddleware, messagesController.getMessageById);



router.put('/messages/:id', authMiddleware, messagesController.updateMessage);


router.delete('/messages/:id', authMiddleware, messagesController.deleteMessage);


router.get('/messages/user/:User_Id', authMiddleware, messagesController.getMessagesByUserId);

module.exports = router;
