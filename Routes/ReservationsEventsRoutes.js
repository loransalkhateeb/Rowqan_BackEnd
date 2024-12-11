const express = require('express');
const router = express.Router();
const reservationEventsController = require('../Controllers/ReservationsEventsController'); 
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createreservationevents', authMiddleware, rateLimiter, reservationEventsController.createReservationEvent);


router.get('/reservation-events/:id/:lang', authMiddleware, rateLimiter, reservationEventsController.getReservationEventById);

router.get('/getAllreservationevents/:lang', authMiddleware, rateLimiter, reservationEventsController.getAllReservationEvents);


router.get('/getAllreservationeventsByAvailableId/:available_event_id/:lang', authMiddleware, rateLimiter, reservationEventsController.getAllReservationEventsByAvailableId);


router.put('/reservation-events/:id', authMiddleware, rateLimiter, reservationEventsController.updateReservationEvent);


router.delete('/reservation-events/:id/:lang', authMiddleware, rateLimiter, reservationEventsController.deleteReservationEvent);


router.get('/reservation-events', authMiddleware, rateLimiter, reservationEventsController.getAllReservationEvents);

module.exports = router;
