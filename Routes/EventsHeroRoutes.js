const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const eventsHeroController = require('../Controllers/HeroEventController');


router.post( '/createheroevent', multer.single('image'),eventsHeroController.createEventHero);


router.get('/allheroevents/:lang', eventsHeroController.getAllEventHeroes);  


router.get('/getheroeventbyid/:id/:lang', eventsHeroController.getEventHeroById);


router.put('/updateheroevents/:id', multer.single('image'),  eventsHeroController.updateEventHero);


router.delete('/deleteheroeventbyid/:id/:lang', eventsHeroController.deleteEventHero);

module.exports = router;
