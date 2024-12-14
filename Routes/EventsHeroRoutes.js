const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const eventsHeroController = require('../Controllers/HeroEventController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createheroevent', authMiddleware, rateLimiter, multer.single('image'), eventsHeroController.createEventHero);

router.get('/allheroevents/:lang', eventsHeroController.getAllEventHeroes);  

router.get('/getheroeventbyid/:id/:lang', eventsHeroController.getEventHeroById);

router.put('/updateheroevents/:id', authMiddleware, rateLimiter, multer.single('image'), eventsHeroController.updateEventHero);

router.delete('/deleteheroeventbyid/:id/:lang', authMiddleware, eventsHeroController.deleteEventHero);

module.exports = router;
