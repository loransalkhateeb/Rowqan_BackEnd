const express = require('express');
const router = express.Router();
const FeedBackController = require('../Controllers/FeedBacksController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createfeedback', rateLimiter, FeedBackController.createFeedBack);


router.put('/updatefeedback/:id', rateLimiter, FeedBackController.updateFeedBack);


router.get('/getFeedBackByChaletId/:chalet_id/:lang', FeedBackController.getFeedBackByChaletId);
router.get('/getFeedBackByEventId/:available_event_id/:lang', FeedBackController.getFeedBackByEventId);
router.get('/getFeedBackByLandId/:land_id/:lang', FeedBackController.getFeedBackByLandId);



router.get('/getfeedbackbyid/:id/:lang', FeedBackController.getFeedBackById);


router.delete('/deletefeedback/:id/:lang', FeedBackController.deleteFeedBack);

module.exports = router;
