const express = require('express');
const router = express.Router();
const chaletController = require('../Controllers/ChaletsController');
const multer = require('../Config/Multer');


router.post('/createchalet', multer.single('image'), chaletController.createChalet);


router.get('/getallchalets/:lang', chaletController.getAllChalets);
router.get('/getallchaletsbystatus/:status_id/:lang', chaletController.getChaletByStatus);


router.get('/getchaletbyid/:id', chaletController.getChaletById);


router.get('/getchaletsbydetailtype/:type/:lang', chaletController.getChaletsByDetailType);

router.put('/updatechalet/:id', multer.single('image'), chaletController.updateChalet);


router.delete('/deletechalet/:id/:lang', chaletController.deleteChalet);

module.exports = router;
