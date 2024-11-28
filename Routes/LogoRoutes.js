const express = require('express');
const router = express.Router();
const logoController = require('../Controllers/LogoController'); 
const multer = require('../Config/Multer'); 

router.post('/createlogo',  multer.single('image'),logoController.createLogo);


router.get('/getalllogos', logoController.getAllLogos);


router.get('/getlogobyid/:id', logoController.getLogoById);


router.put('/updatelogo/:id', multer.single('image'), logoController.updatelogo);


router.delete('/deletelogo/:id', logoController.deleteLogo);

module.exports = router;
