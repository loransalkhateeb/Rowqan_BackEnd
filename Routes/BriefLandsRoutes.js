const express = require('express');
const router = express.Router();
const breifLandsController = require('../Controllers/BreifLandsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createbreiflands', authMiddleware, rateLimiter, breifLandsController.createBreifLand);
router.put('/updatebreifland/:id', authMiddleware, rateLimiter, breifLandsController.updateBreifLand);


router.get('/getbreiflands/:category_id', breifLandsController.getAllBreifLandsByCategory);
router.get('/getbreiflandbyid/:id', breifLandsController.getBreifLandById);
router.delete('/deletebreifland/:id/:lang', authMiddleware, breifLandsController.deleteBreifLand);

module.exports = router;
