const express = require('express');
const router = express.Router();

const ReservationsChaletsController = require('../Controllers/ReservationsChaletsController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createReservationChalet', authMiddleware, rateLimiter, ReservationsChaletsController.createReservation);


router.get('/getAllReservationChalet/:lang', authMiddleware, ReservationsChaletsController.getAllReservations);


router.get('/getAllReservationChaletById/:id/:lang', authMiddleware, ReservationsChaletsController.getReservationById);


router.put('/reservations/:id', authMiddleware, rateLimiter, ReservationsChaletsController.updateReservation);



router.get('/reservationsByChaletId/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);
router.get('/reservationsByright_time_id/:right_time_id/:lang', ReservationsChaletsController.getReservationsByRightTimeId);

router.get('/reservationsByUserId/:user_id/:lang', ReservationsChaletsController.getReservationsByChaletId);


router.delete('/reservations/:id', authMiddleware, ReservationsChaletsController.deleteReservation);


router.get('/reservationsByChaletId/:chalet_id/:lang', authMiddleware, ReservationsChaletsController.getReservationsByChaletId);


// router.get('/reservations/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);

module.exports = router;
