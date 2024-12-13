const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const AvailableEventsController = require('../Controllers/AvailableEvenetsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createavailablevent', authMiddleware, rateLimiter, multer.single('image'), AvailableEventsController.createAvailableEvent);
router.put('/updateavailablevents/:id', authMiddleware, rateLimiter, multer.single('image'), AvailableEventsController.updateAvailableEvent);
router.get('/subevent/:sub_event_id/:lang', authMiddleware, AvailableEventsController.getAvailableEventsBySubEventId);
router.get('/getavilablevntsbyid/:id/:lang', authMiddleware, AvailableEventsController.getAvailableEventsById);
router.get('/getavilablevntsbydate/:sub_event_id/:lang/:date', authMiddleware, AvailableEventsController.getAvailableEventsBySubEventIdAndDate);
router.get('/getavilablevntsbydateonly/:lang/:date', authMiddleware, AvailableEventsController.getAvailableEventsBySubDateOnly);
router.delete('/deleteavailablevnts/:id/:lang', authMiddleware, AvailableEventsController.deleteAvailableEvent);

module.exports = router;
