const express = require('express');
const router = express.Router();
const MessagesController = require('../Controllers/MessagesController');


router.post('/SendMessage', (req, res, next) => {
  req.socketIoInstance = req.app.get('socketIoInstance'); 
  MessagesController.createMessage(req, res, next);
});


router.get('/betweenMessage/:senderId/:receiverId', (req, res, next) => {
  req.socketIoInstance = req.app.get('socketIoInstance'); 
  MessagesController.getMessagesBetweenUsers(req, res, next);
});




router.get('/sent/:senderId', (req, res, next) => {
  req.socketIoInstance = req.app.get('socketIoInstance');
  MessagesController.getSentMessages(req, res, next);
});




router.get('/received/:receiverId', (req, res, next) => {
  req.socketIoInstance = req.app.get('socketIoInstance');
  MessagesController.getReceivedMessages(req, res, next);
});



router.delete('/:messageId', (req, res, next) => {
  req.socketIoInstance = req.app.get('socketIoInstance');
  MessagesController.deleteMessage(req, res, next);
});

module.exports = router;
