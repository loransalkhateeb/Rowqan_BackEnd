const express = require('express');
const router = express.Router();
const heroController = require('../Controllers/HeroController');  
const multer = require('../Config/Multer'); 

router.post('/createHero', multer.single('image'), heroController.createHero);


router.get('/getAllHeroes/:lang', heroController.getAllHeroesByLang);


router.get('/getHeroById/:id/:lang', heroController.getHeroById);


router.put('/updateHero/:id/:lang', multer.single('image'), heroController.updateHero);


router.delete('/deleteHero/:id/:lang', heroController.deleteHero);

module.exports = router;
