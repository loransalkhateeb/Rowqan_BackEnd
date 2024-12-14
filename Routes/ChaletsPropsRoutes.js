const express = require('express');
const router = express.Router();
const ChaletsPropsController = require('../Controllers/ChaletsPropsController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createPropsChalet', authMiddleware, rateLimiter, multer.single("image"), ChaletsPropsController.createChaletProp);


router.get('/getAllPropsChalet/:lang', ChaletsPropsController.getAllChaletProps);
router.get('/getPropChaletById:id', ChaletsPropsController.getChaletPropById);
router.put('/UpdatePropChalet/:id', rateLimiter, ChaletsPropsController.updateProperty);
router.delete('/DeletePropChalet:id', authMiddleware, ChaletsPropsController.deleteChaletProp);

module.exports = router;


module.exports = router;
