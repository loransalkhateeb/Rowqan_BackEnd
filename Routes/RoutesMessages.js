const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');


router.post('/sendMessage', MessageController.sendMessage);


router.get('/GetAllMessages/:senderId/:receiverId', MessageController.getAllMessages);

router.get('/AllMessages', MessageController.getAllMessages);

router.get('/getUserMessage/:userId', MessageController.getUserMessages);


router.put('/update-status', MessageController.updateMessageStatus);


router.delete('/delete/:messageId', MessageController.deleteMessage);

module.exports = router;
