const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer');  
const HeroLandsController = require('../Controllers/HeroLandController');


router.post('/createheroland', multer.single('image'), HeroLandsController.createHeroLand);


router.get('/getAllHerosLands/:lang', HeroLandsController.getAllHeroLands);


router.get('/getHeroLandById/:id/:lang', HeroLandsController.getHeroLandById);


router.put('/updateheroland/:id', multer.single('image'), HeroLandsController.updateHeroLand);


router.delete('/deleteheroland/:id/:lang', HeroLandsController.deleteHeroLand);

module.exports = router;
