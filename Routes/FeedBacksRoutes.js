const express = require('express');
const router = express.Router();
const FeedBackController = require('../Controllers/FeedBacksController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createfeedback', authMiddleware, rateLimiter, FeedBackController.createFeedBack);


router.put('/updatefeedback/:id', authMiddleware, rateLimiter, FeedBackController.updateFeedBack);


router.get('/getFeedBackByChaletId/:chalet_id/:lang', authMiddleware, FeedBackController.getFeedBackByChaletId);
router.get('/getFeedBackByEventId/:available_event_id/:lang', authMiddleware, FeedBackController.getFeedBackByEventId);
router.get('/getFeedBackByLandId/:land_id/:lang', authMiddleware, FeedBackController.getFeedBackByLandId);



router.get('/getfeedbackbyid/:id/:lang', authMiddleware, FeedBackController.getFeedBackById);


router.delete('/deletefeedback/:id/:lang', authMiddleware, FeedBackController.deleteFeedBack);

module.exports = router;
