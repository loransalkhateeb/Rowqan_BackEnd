const express = require('express');
const router = express.Router();

const ReservationsChaletsController = require('../Controllers/ReservationsChaletsController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createReservationChalet', authMiddleware, rateLimiter, ReservationsChaletsController.createReservation);


router.get('/getAllReservationChalet/:lang', ReservationsChaletsController.getAllReservations);


router.get('/getAllReservationChaletById/:id/:lang', ReservationsChaletsController.getReservationById);


router.put('/reservations/:id', authMiddleware, rateLimiter, ReservationsChaletsController.updateReservation);



router.get('/reservationsByChaletId/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);
router.get('/reservationsByright_time_name/:name/:lang', ReservationsChaletsController.getReservationsByRightTimeName);

router.get('/reservationsByUserId/:user_id/:lang', ReservationsChaletsController.getReservationsByChaletId);

router.get('/available-times',ReservationsChaletsController.getAvailableTimesByDate)


router.delete('/reservations/:id', authMiddleware, ReservationsChaletsController.deleteReservation);


router.get('/reservationsByChaletId/:chalet_id/:lang', authMiddleware, ReservationsChaletsController.getReservationsByChaletId);


// router.get('/reservations/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);

module.exports = router;
