const express = require('express');
const router = express.Router();
const breifLandsController = require('../Controllers/BreifLandsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createbreiflands', rateLimiter, breifLandsController.createBreifLand);
router.put('/updatebreifland/:id', rateLimiter, breifLandsController.updateBreifLand);


router.get('/getbreiflands/:category_id', breifLandsController.getAllBreifLandsByCategory);
router.get('/getbreiflandbyid/:id', breifLandsController.getBreifLandById);
router.delete('/deletebreifland/:id/:lang', breifLandsController.deleteBreifLand);

module.exports = router;
