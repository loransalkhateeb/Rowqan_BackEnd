const express = require('express');
const router = express.Router();

const ReservationController = require('../Controllers/ReservationsController');


router.post('/createreservation', ReservationController.createReservation);


router.get('/getAllreservations/:lang', ReservationController.getAllReservations);


router.get('/getReservationById/:id/:lang', ReservationController.getReservationById);


router.put('/updatereservations/:id', ReservationController.updateReservation);


router.delete('/delteReservation/:id/:lang', ReservationController.deleteReservation);

module.exports = router;
