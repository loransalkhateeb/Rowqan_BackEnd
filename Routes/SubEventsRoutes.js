const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const SubEventsController = require('../Controllers/SubEventsController');


router.post('/createsubevents', multer.single('image'), SubEventsController.createSubEvent);


router.get('/getsubeventsbyid/:event_id/:lang', SubEventsController.getSubEventsByEventId);
router.get('/getallsubevents/:lang', SubEventsController.getAllSubEvents);
router.get('/getsubeventsbyid/:id/:lang', SubEventsController.getSubEventsById);

router.put('/updatesubevents/:id', multer.single('image'), SubEventsController.updateSubEvent);


router.delete('/deltesubevents/:id/:lang', SubEventsController.deleteSubEvent);

module.exports = router;
