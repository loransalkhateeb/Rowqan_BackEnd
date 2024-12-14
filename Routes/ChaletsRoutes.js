const express = require('express');
const router = express.Router();
const chaletController = require('../Controllers/ChaletsController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createchalet', authMiddleware, rateLimiter, multer.single('image'), chaletController.createChalet);


router.get('/getallchalets/:lang', chaletController.getAllChalets);
router.get('/getchalets/:lang', chaletController.getAllChalets);
// router.get('/getallchaletsbystatus/:status_id/:lang', authMiddleware, chaletController.getChaletByStatus);
router.get('/getchaletbyid/:id', chaletController.getChaletById);
router.get('/getchaletsbydetailtype/:type/:lang', chaletController.getChaletsByDetailType);


router.put('/updatechalet/:id', authMiddleware, rateLimiter, multer.single('image'), chaletController.updateChalet);


router.delete('/deletechalet/:id/:lang', authMiddleware, chaletController.deleteChalet);

module.exports = router;
