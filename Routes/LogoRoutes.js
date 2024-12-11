const express = require('express');
const router = express.Router();
const logoController = require('../Controllers/LogoController'); 
const multer = require('../Config/Multer'); 
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createlogo', authMiddleware, rateLimiter, multer.single('image'), logoController.createLogo);

router.get('/getalllogos', authMiddleware, logoController.getAllLogos);

router.get('/getlogobyid/:id', authMiddleware, logoController.getLogoById);

router.put('/updatelogo/:id', authMiddleware, rateLimiter, multer.single('image'), logoController.updatelogo);

router.delete('/deletelogo/:id', authMiddleware, logoController.deleteLogo);

module.exports = router;
