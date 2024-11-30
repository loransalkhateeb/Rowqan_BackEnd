const express = require('express');
const router = express.Router();
const typesEventsController = require('../Controllers/TypesEvenetsController');


router.post('/createventtype', typesEventsController.createEventType);


router.get('/getalleventtypes', typesEventsController.getAllEventTypes);


router.get('/geteventtype/:id', typesEventsController.getEventTypeById);


router.put('/updateventtype/:id', typesEventsController.updateEventType);


router.delete('/deleteventtype/:id', typesEventsController.deleteEventType);

module.exports = router;
