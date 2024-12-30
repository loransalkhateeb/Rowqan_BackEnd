const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer');
const chaletsImagesController = require('../Controllers/ChaletsImagesController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createchaletImage', rateLimiter, upload.array('image'), chaletsImagesController.createChaletImages);
router.put('/updateChaletImage/:id', rateLimiter, upload.single('image'), chaletsImagesController.updateChaletImage);


router.get('/chaletgetChaletImage/:chalet_id', chaletsImagesController.getImagesByChaletId);
router.get('/getChaletImageById/:id', chaletsImagesController.getChaletImageById);
router.delete('/deleteChaletImage/:id', chaletsImagesController.deleteChaletImage);

module.exports = router;
