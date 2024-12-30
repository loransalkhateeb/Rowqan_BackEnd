const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const AvailableEventsImagesController = require('../Controllers/AvailableEventsImagesController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createvailableimage', rateLimiter, multer.array('image'), AvailableEventsImagesController.createAvailableEventImages);
router.put('/updateimageavailable/:id', rateLimiter, multer.array('image'), AvailableEventsImagesController.updateAvailableEventImage);


router.get('/getavailableimage/:event_id', AvailableEventsImagesController.getAvailableEventImages);
router.delete('/deleteavilableimage/:id', AvailableEventsImagesController.deleteAvailableEventImage);

module.exports = router;
