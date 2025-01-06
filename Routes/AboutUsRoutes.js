const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const AboutController = require('../Controllers/AboutController'); 
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');  


router.post('/createabout', multer.single('image'), AboutController.createAbout);

router.put('/updateabout/:id', rateLimiter, multer.single('image'), AboutController.updateAbout);

router.get('/getabout/:lang', AboutController.getAbout);


router.get('/getaboutById/:id/:lang', AboutController.getAboutById);


router.delete('/deleteabout/:id/:lang', AboutController.deleteAbout);

module.exports = router;