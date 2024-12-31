const express = require('express');
const router = express.Router();
const ResevationLandsController = require('../Controllers/ReservationLandsController');
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter');


// router.use(authMiddleware);


router.post('/createreservationslands', rateLimiter, ResevationLandsController.createReservationLand);


router.get('/getreservationslands/:lang', ResevationLandsController.getAllReservations);


router.get('/getreservationslands/:id/:lang', ResevationLandsController.getReservationById);
router.get('/getreservationslandsbyavailable_land_id/:available_land_id/:lang', ResevationLandsController.getReservationByAvailable_land_id);
router.get('/getreservationslandsbyuser_id/:user_id/:lang', ResevationLandsController.getReservationByUser_id);


router.put('/updatereservationslands/:id', rateLimiter, ResevationLandsController.updateReservation);


router.delete('/deletereservationslands/:id/:lang', ResevationLandsController.deleteReservation);

module.exports = router;
