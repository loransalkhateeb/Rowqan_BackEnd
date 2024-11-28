const express = require('express');
const router = express.Router();
const StatusChaletsController = require('../Controllers/StatusChaletsController'); 
const multer = require('../Config/Multer'); 


router.post('/createStatusChalets', multer.single('image'), StatusChaletsController.createStatusChalet);


router.get('/getAllStatusChalets', StatusChaletsController.getAllStatusChalets);
router.get('/getstatusChaletbyid/:id', StatusChaletsController.getStatusChaletById);


router.put('/updateStatusChalets/:id', multer.single('image'), StatusChaletsController.updateStatusChalet);


router.delete('/deletStatusChalets/:id', StatusChaletsController.deleteStatusChalet);

module.exports = router;
