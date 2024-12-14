const express = require('express');
const router = express.Router();
const rightTimeController = require('../Controllers/RightTimeController'); 
const multer = require('../Config/Multer'); 
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter'); 




router.post('/createrighttime',authMiddleware, rateLimiter, multer.single('image'), rightTimeController.createRightTime);


router.get('/getallrighttimes/:lang', rightTimeController.get);


router.get('/getallrighttimes/:lang/:chalet_id', rightTimeController.getAllRightTimesByChaletId);


router.get('/getrighttimebyid/:id/:lang', rightTimeController.getRightTimeById);


router.put('/updaterighttime/:id',authMiddleware, rateLimiter, multer.single('image'), rightTimeController.updateRightTime);


router.delete('/deleterighttime/:id/:lang',authMiddleware, rightTimeController.deleteRightTime);

module.exports = router;
