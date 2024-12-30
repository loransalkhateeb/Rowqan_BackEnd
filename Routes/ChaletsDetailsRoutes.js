const express = require('express');
const router = express.Router();
const chaletsDetailsController = require('../Controllers/ChaletsDetailsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createdetails', rateLimiter, chaletsDetailsController.createChaletDetail);
router.put('/updatedetails/:id', rateLimiter, chaletsDetailsController.updateChaletDetail);


router.get('/getalldetails/:lang', chaletsDetailsController.getAllDetails);
router.get('/getdetailsbychaletid/:id/:lang', chaletsDetailsController.getChaletDetailsByChaletId);
router.get('/getChaletDetailsByChaletId/:chalet_id/:lang', chaletsDetailsController.getChaletDetailsByChaletId);
router.delete('/deleteddetaile/:id/:lang', chaletsDetailsController.deleteChaletDetail);

module.exports = router;
