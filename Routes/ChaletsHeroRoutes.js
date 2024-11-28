const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer'); 
const chaletsHeroController = require('../Controllers/ChaletsHeroController');


router.post('/createherochalets', upload.single('image'), chaletsHeroController.createChaletsHero);


router.put('/updatechaletshero/:id', upload.single('image'), chaletsHeroController.updateChaletsHero);


router.get('/getherochaletsbyid/:id/:lang', chaletsHeroController.getChaletsHeroById);
router.get('/getAllHeroChalets/:lang', chaletsHeroController.getAllChaletsHero);


router.delete('/deleteHeroChalets/:id', chaletsHeroController.deleteChaletsHero);

module.exports = router;
