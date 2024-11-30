const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer');
const chaletsImagesController = require('../Controllers/ChaletsImagesController');

router.post('/createchaletImage', upload.single('image'), chaletsImagesController.createChaletImage);
router.get('/chaletgetChaletImage/:chalet_id', chaletsImagesController.getImagesByChaletId);
router.get('/getChaletImageById/:id', chaletsImagesController.getChaletImageById);
router.put('/updateChaletImage/:id', upload.single('image'), chaletsImagesController.updateChaletImage);
router.delete('/deleteChaletImage/:id', chaletsImagesController.deleteChaletImage);

module.exports = router;
