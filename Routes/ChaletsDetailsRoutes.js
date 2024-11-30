const express = require('express');
const router = express.Router();
const chaletsDetailsController = require('../Controllers/ChaletsDetailsController');


router.post('/createdetails', chaletsDetailsController.createChaletDetail);


router.get('/getalldetails/:lang', chaletsDetailsController.getAllDetails);


router.get('/getdetailsbychaletid/:id/:lang', chaletsDetailsController.getChaletDetailsByChaletId);
router.get('/getChaletDetailsByChaletId/:chalet_id/:lang/:id', chaletsDetailsController.getChaletDetailsByChaletId);


router.put('/updatedetails/:id', chaletsDetailsController.updateChaletDetail);

router.delete('/deleteddetaile/:id/:lang', chaletsDetailsController.deleteChaletDetail);

module.exports = router;
