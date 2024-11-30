const express = require('express');
const router = express.Router();
const reservationDatesController = require('../Controllers/ReservationDatesController');


router.post('/createreservationdate', reservationDatesController.createReservationDate);


router.get('/getreservationdatesbychalet/:chalet_id/:lang', reservationDatesController.getReservationDatesByChaletId);


router.get('/getreservationdatebyid/:id/:lang', reservationDatesController.getReservationDateById);


router.put('/updatereservationdate/:id/:lang', reservationDatesController.updateReservationDate);


router.delete('/deletereservationdate/:id/:lang', reservationDatesController.deleteReservationDate);

module.exports = router;

