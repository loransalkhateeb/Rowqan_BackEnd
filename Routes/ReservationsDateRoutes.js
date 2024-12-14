const express = require('express');
const router = express.Router();

const reservationDatesController = require('../Controllers/ReservationDatesController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createreservationdate', authMiddleware, rateLimiter, reservationDatesController.createReservationDate);


router.get('/getreservationdatesbychalet/:chalet_id/:lang', authMiddleware, reservationDatesController.getReservationDatesByChaletId);


router.get('/getAllReservationDates/:lang', authMiddleware, reservationDatesController.getAllReservationsDates);


router.get('/getreservationdatebyid/:id/:lang', authMiddleware, reservationDatesController.getReservationDateById);


router.put('/updatereservationdate/:id/:lang', authMiddleware, rateLimiter, reservationDatesController.updateReservationDate);


router.delete('/deletereservationdate/:id/:lang', authMiddleware, reservationDatesController.deleteReservationDate);

module.exports = router;
