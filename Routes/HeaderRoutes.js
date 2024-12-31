const express = require('express');
const router = express.Router();
const headerController = require('../Controllers/HeaderController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createHeader', rateLimiter, headerController.createHeader);


router.get('/getAllHeaders/:lang', headerController.getAllHeaders);


router.get('/getHeaderById/:id/:lang', headerController.getHeaderById);


router.put('/updateHeader/:id', rateLimiter, headerController.updateHeader);


router.delete('/deleteHeader/:id/:lang', headerController.deleteHeader);

module.exports = router;
