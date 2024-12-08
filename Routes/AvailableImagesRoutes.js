const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const AvailableEventsImagesController = require('../Controllers/AvailableEventsImagesController');


router.post('/createvailableimage', multer.array('image'), AvailableEventsImagesController.createAvailableEventImages);


router.get('/getavailableimage/:event_id', AvailableEventsImagesController.getAvailableEventImages);


router.put('/updateimageavailable/:id', multer.array('image'), AvailableEventsImagesController.updateAvailableEventImage);


router.delete('/deleteavilableimage/:id', AvailableEventsImagesController.deleteAvailableEventImage);

module.exports = router;
