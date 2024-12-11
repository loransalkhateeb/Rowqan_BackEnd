const express = require('express');
const router = express.Router();
const typesEventsController = require('../Controllers/TypesEvenetsController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.post('/createventtype', authMiddleware, rateLimiter, typesEventsController.createEventType);

router.get('/getalleventtypes', rateLimiter, typesEventsController.getAllEventTypes);

router.get('/geteventtype/:id', rateLimiter, typesEventsController.getEventTypeById);

router.put('/updateventtype/:id', authMiddleware, rateLimiter, typesEventsController.updateEventType);

router.delete('/deleteventtype/:id', authMiddleware, rateLimiter, typesEventsController.deleteEventType);

module.exports = router;
