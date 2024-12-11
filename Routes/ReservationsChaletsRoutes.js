const express = require('express');
const router = express.Router();


const ReservationsChaletsController = require('../Controllers/ReservationsChaletsController');



router.post('/createReservationChalet', ReservationsChaletsController.createReservation);

router.get('/getAllReservationChalet/:lang', ReservationsChaletsController.getAllReservations);
router.get('/getAllReservationChaletById/:id/:lang', ReservationsChaletsController.getReservationById);


router.put('/reservations/:id', ReservationsChaletsController.updateReservation);




router.delete('/reservations/:id', ReservationsChaletsController.deleteReservation);


router.get('/reservationsByChaletId/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);
router.get('/reservationsByUserId/:user_id/:lang', ReservationsChaletsController.getReservationsByUserId);





// router.get('/reservations/:chalet_id/:lang', ReservationsChaletsController.getReservationsByChaletId);

module.exports = router;
