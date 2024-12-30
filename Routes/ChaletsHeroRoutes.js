const express = require('express');
const router = express.Router();
const upload = require('../Config/Multer'); 
const chaletsHeroController = require('../Controllers/ChaletsHeroController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createherochalets', rateLimiter, upload.single('image'), chaletsHeroController.createChaletsHero);
router.put('/updatechaletshero/:id', rateLimiter, upload.single('image'), chaletsHeroController.updateChaletsHero);


router.get('/getherochaletsbyid/:id/:lang', chaletsHeroController.getChaletsHeroById);
router.get('/getAllHeroChalets/:lang', chaletsHeroController.getAllChaletsHero);
router.delete('/deleteHeroChalets/:id', chaletsHeroController.deleteChaletsHero);

module.exports = router;
