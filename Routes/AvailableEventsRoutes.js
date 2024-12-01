const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const AvailableEventsController = require('../Controllers/AvailableEvenetsController');


router.post('/createavailablevent', multer.single('image'), AvailableEventsController.createAvailableEvent);


router.get('/subevent/:sub_event_id/:lang', AvailableEventsController.getAvailableEventsBySubEventId);
router.get('/getavilablevntsbyid/:id/:lang', AvailableEventsController.getAvailableEventsById);


router.get('/getavilablevntsbydate/:sub_event_id/:lang/:date', AvailableEventsController.getAvailableEventsBySubEventIdAndDate);
router.get('/getavilablevntsbydateonly/:lang/:date', AvailableEventsController.getAvailableEventsBySubDateOnly);


router.put('/updateavailablevents/:id', multer.single('image'), AvailableEventsController.updateAvailableEvent);


router.delete('/deleteavailablevnts/:id/:lang', AvailableEventsController.deleteAvailableEvent);

module.exports = router;