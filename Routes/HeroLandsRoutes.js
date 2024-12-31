const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');  
const HeroLandsController = require('../Controllers/HeroLandController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createheroland', rateLimiter, multer.single('image'), HeroLandsController.createHeroLand);

router.get('/getAllHerosLands/:lang', HeroLandsController.getAllHeroLands);

router.get('/getHeroLandById/:id/:lang', HeroLandsController.getHeroLandById);

router.put('/updateheroland/:id', rateLimiter, multer.single('image'), HeroLandsController.updateHeroLand);

router.delete('/deleteheroland/:id/:lang', HeroLandsController.deleteHeroLand);

module.exports = router;
