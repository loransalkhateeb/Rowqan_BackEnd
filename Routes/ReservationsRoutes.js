const express = require('express');
const router = express.Router();

const ReservationController = require('../Controllers/ReservationsController');
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.use(authMiddleware);


router.post('/createreservation', rateLimiter, ReservationController.createReservation);


router.get('/getAllreservations/:lang', ReservationController.getAllReservations);


router.get('/getReservationById/:id/:lang', ReservationController.getReservationById);


router.put('/updatereservations/:id', rateLimiter, ReservationController.updateReservation);


router.delete('/delteReservation/:id/:lang', ReservationController.deleteReservation);

module.exports = router;
