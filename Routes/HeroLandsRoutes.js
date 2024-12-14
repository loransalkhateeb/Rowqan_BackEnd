const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');  
const HeroLandsController = require('../Controllers/HeroLandController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createheroland', authMiddleware, rateLimiter, multer.single('image'), HeroLandsController.createHeroLand);

router.get('/getAllHerosLands/:lang', authMiddleware, HeroLandsController.getAllHeroLands);

router.get('/getHeroLandById/:id/:lang', authMiddleware, HeroLandsController.getHeroLandById);

router.put('/updateheroland/:id', authMiddleware, rateLimiter, multer.single('image'), HeroLandsController.updateHeroLand);

router.delete('/deleteheroland/:id/:lang', authMiddleware, HeroLandsController.deleteHeroLand);

module.exports = router;
