const express = require('express');
const router = express.Router();

const reservationDatesController = require('../Controllers/ReservationDatesController');
// const authMiddleware = require('../MiddleWares/authMiddleware');
// const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createReservation', reservationDatesController.createReservationDate);


router.get('/getreservationdatesbychalet/:chalet_id/:lang', reservationDatesController.getReservationDatesByChaletId);


router.get('/getAllReservationDates/:lang', reservationDatesController.getAllReservationsDates);


router.get('/getreservationdatebyid/:id/:lang', reservationDatesController.getReservationDateById);


router.put('/updatereservationdate/:id/:lang', reservationDatesController.updateReservationDate);


router.delete('/deletereservationdate/:id/:lang', reservationDatesController.deleteReservationDate);

module.exports = router;
