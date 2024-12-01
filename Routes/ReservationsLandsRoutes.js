const express = require('express');
const router = express.Router();
const ResevationLandsController = require('../Controllers/ReservationLandsController');


router.post('/createreservationslands', ResevationLandsController.createReservationLand);


router.get('/getreservationslands/:lang', ResevationLandsController.getAllReservations);


router.get('/getreservationslands/:id/:lang', ResevationLandsController.getReservationById);


router.put('/updatereservationslands/:id', ResevationLandsController.updateReservation);


router.delete('/deletereservationslands/:id/:lang', ResevationLandsController.deleteReservation);

module.exports = router;
