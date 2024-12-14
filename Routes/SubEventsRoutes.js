const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');
const SubEventsController = require('../Controllers/SubEventsController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.post('/createsubevents', authMiddleware, rateLimiter, multer.single('image'), SubEventsController.createSubEvent);

router.get('/getsubeventsbyid/:event_id/:lang', rateLimiter, SubEventsController.getSubEventsByEventId);
router.get('/getallsubevents/:lang', rateLimiter, SubEventsController.getAllSubEvents);
router.get('/getsubeventsbyid/:id/:lang', rateLimiter, SubEventsController.getSubEventsById);

router.put('/updatesubevents/:id', authMiddleware, rateLimiter, multer.single('image'), SubEventsController.updateSubEvent);

router.delete('/deltesubevents/:id/:lang', authMiddleware, rateLimiter, SubEventsController.deleteSubEvent);

module.exports = router;
