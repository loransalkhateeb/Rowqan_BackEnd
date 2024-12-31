const express = require('express');
const router = express.Router();
const footerController = require('../Controllers/FooterController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createFooter', rateLimiter, footerController.createFooter);

router.get('/getAllFooters/:lang', footerController.getAllFooters);

router.get('/getFooterById/:id/:lang', footerController.getFooterById);

router.put('/updateFooter/:id', rateLimiter, footerController.updateFooter);

router.delete('/deleteFooter/:id/:lang', footerController.deleteFooter);

module.exports = router;
