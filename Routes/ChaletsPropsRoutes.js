const express = require('express');
const router = express.Router();
const ChaletsPropsController = require('../Controllers/ChaletsPropsController');
const multer = require('../Config/Multer')

router.post('/createPropsChalet', multer.single("image"),ChaletsPropsController.createChaletProp);


router.get('/getAllPropsChalet/:lang', ChaletsPropsController.getAllChaletProps);


router.get('/getPropChaletById:id', ChaletsPropsController.getChaletPropById);


router.put('/UpdatePropChalet/:id', ChaletsPropsController.updateProperty);


router.delete('/DeletePropChalet:id', ChaletsPropsController.deleteChaletProp);

module.exports = router;
