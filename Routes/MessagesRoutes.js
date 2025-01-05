const express = require('express');
const app = express();
const router = express.Router();
const MessagesController = require('../Controllers/MessagesController');
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);


app.use((req, res, next) => {
  req.socketIoInstance = io; 
  next();
});


router.post('/SendMessage', (req, res, next) => {
  MessagesController.createMessage(req, res, next);
});

router.get('/betweenMessage/:senderId/:receiverId', (req, res, next) => {
  MessagesController.getMessagesBetweenUsers(req, res, next);
});

router.get('/sent/:senderId', (req, res, next) => {
  MessagesController.getSentMessages(req, res, next);
});

router.get('/received/:receiverId', (req, res, next) => {
  MessagesController.getReceivedMessages(req, res, next);
});

router.delete('/:messageId', (req, res, next) => {
  MessagesController.deleteMessage(req, res, next);
});



module.exports = router;
