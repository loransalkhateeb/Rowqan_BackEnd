const express = require('express');
const router = express.Router();
const chaletsDetailsController = require('../Controllers/ChaletsDetailsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createdetails', authMiddleware, rateLimiter, chaletsDetailsController.createChaletDetail);
router.put('/updatedetails/:id', authMiddleware, rateLimiter, chaletsDetailsController.updateChaletDetail);


router.get('/getalldetails/:lang', authMiddleware, chaletsDetailsController.getAllDetails);
router.get('/getdetailsbychaletid/:id/:lang', authMiddleware, chaletsDetailsController.getChaletDetailsByChaletId);
router.get('/getChaletDetailsByChaletId/:chalet_id/:lang', authMiddleware, chaletsDetailsController.getChaletDetailsByChaletId);
router.delete('/deleteddetaile/:id/:lang', authMiddleware, chaletsDetailsController.deleteChaletDetail);

module.exports = router;
