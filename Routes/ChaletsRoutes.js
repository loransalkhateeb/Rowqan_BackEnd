const express = require('express');
const router = express.Router();
const chaletController = require('../Controllers/ChaletsController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createchalet', rateLimiter, multer.single('image'), chaletController.createChalet);


router.get('/getallchalets/:lang', chaletController.getAllChalets);
router.get('/getchalets/:lang', chaletController.getAllChaletsFront);
router.get('/getallchaletsbystatus/:status_id/:lang', chaletController.getChaletByStatus);
router.get('/getchaletbyid/:id', chaletController.getChaletById);
router.get('/getchaletsbydetailtype/:type/:lang', chaletController.getChaletsByDetailType);

router.get('/getAllChaletProps/:lang',rateLimiter,chaletController.getAllChaletsByProps)

router.put('/updatechalet/:id', rateLimiter, multer.single('image'), chaletController.updateChalet);


router.delete('/deletechalet/:id/:lang', chaletController.deleteChalet);

module.exports = router;
