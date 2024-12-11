const express = require('express');
const router = express.Router();
const reservationEventsController = require('../Controllers/ReservationsEventsController'); 


router.post('/createreservationevents', reservationEventsController.createReservationEvent);


router.get('/reservation-events/:id/:lang', reservationEventsController.getReservationEventById);
router.get('/getAllreservationevents/:lang', reservationEventsController.getAllReservationEvents);


router.get('/getAllreservationeventsByAvailableId/:available_event_id/:lang', reservationEventsController.getAllReservationEventsByAvailableId);

router.get('/getAllreservationeventsByUserId/:user_id/:lang', reservationEventsController.getAllReservationEventsByUserId);

router.put('/reservation-events/:id', reservationEventsController.updateReservationEvent);


router.delete('/reservation-events/:id/:lang', reservationEventsController.deleteReservationEvent);


router.get('/reservation-events', reservationEventsController.getAllReservationEvents);

module.exports = router;
