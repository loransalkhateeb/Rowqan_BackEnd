const express = require('express');
const router = express.Router();
const ChaletsPropsController = require('../Controllers/ChaletsPropsController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createPropsChalet', rateLimiter, multer.single("image"), ChaletsPropsController.createChaletProp);


router.get('/getAllPropsChalet/:lang', ChaletsPropsController.getAllChaletProps);
router.get('/getPropChaletById/:id/:lang', ChaletsPropsController.getChaletPropById);

router.get('/getAllChaletPropsByChaletId/:Chalet_Id/:lang',rateLimiter,ChaletsPropsController.getAllChaletPropsByChaletId)


router.put('/UpdatePropChalet/:id', rateLimiter, ChaletsPropsController.updateProperty);
router.delete('/DeletePropChalet/:id/:lang',rateLimiter, ChaletsPropsController.deleteChaletProp);

module.exports = router;


module.exports = router;
