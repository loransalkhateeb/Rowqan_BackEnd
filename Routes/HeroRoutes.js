const express = require('express');
const router = express.Router();
const heroController = require('../Controllers/HeroController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createHero', authMiddleware, rateLimiter, multer.single('image'), heroController.createHero);


router.get('/getAllHeroes/:lang', heroController.getHeroesByLang);


router.get('/getHeroById/:id/:lang', heroController.getHeroById);

router.put('/updateHero/:id', authMiddleware, rateLimiter, multer.single('image'), heroController.updateHero);


router.delete('/deleteHero/:id/:lang', authMiddleware, heroController.deleteHero);

module.exports = router;
