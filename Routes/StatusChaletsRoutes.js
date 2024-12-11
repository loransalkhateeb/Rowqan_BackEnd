const express = require('express');
const router = express.Router();
const StatusChaletsController = require('../Controllers/StatusChaletsController'); 
const multer = require('../Config/Multer'); 
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter')


router.use(authMiddleware);


router.post('/createStatusChalets', rateLimiter, multer.single('image'), StatusChaletsController.createStatusChalet);


router.get('/getAllStatusChalets', StatusChaletsController.getAllStatusChalets);


router.get('/getstatusChaletbyid/:id', StatusChaletsController.getStatusChaletById);


router.put('/updateStatusChalets/:id', rateLimiter, multer.single('image'), StatusChaletsController.updateStatusChalet);


router.delete('/deletStatusChalets/:id', StatusChaletsController.deleteStatusChalet);

module.exports = router;
