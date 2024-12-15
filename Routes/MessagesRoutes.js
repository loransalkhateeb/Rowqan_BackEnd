const express = require('express');
const router = express.Router();
const MessagesController = require('../Controllers/MessagesController');


router.post('/SendMessage', MessagesController.createMessage);


router.get('/betweenMessage/:senderId/:receiverId', MessagesController.getMessagesBetweenUsers);


router.get('/sent/:senderId', MessagesController.getSentMessages);


router.get('/received/:receiverId', MessagesController.getReceivedMessages);


router.delete('/:messageId', MessagesController.deleteMessage);

module.exports = router;
