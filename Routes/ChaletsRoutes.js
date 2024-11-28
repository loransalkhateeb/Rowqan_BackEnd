const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer'); 
const chaletsController = require('../Controllers/ChaletsController');


router.post('/createchalets', upload.single('image'), chaletsController.createChalet);


router.put('/updatechaletshero/:id', upload.single('image'), chaletsController.updateChalet);


router.get('/getchaletsbyid/:id/:lang', chaletsController.getChaletById);
router.get('/getAllChalets/:lang', chaletsController.getAllChalets);


router.delete('/deleteChalets/:id', chaletsController.deleteChalet);

module.exports = router;
