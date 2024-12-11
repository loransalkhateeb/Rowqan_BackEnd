const express = require('express');
const router = express.Router();
const footerController = require('../Controllers/FooterController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createFooter', authMiddleware, rateLimiter, footerController.createFooter);

router.get('/getAllFooters/:lang', authMiddleware, footerController.getAllFooters);

router.get('/getFooterById/:id/:lang', authMiddleware, footerController.getFooterById);

router.put('/updateFooter/:id', authMiddleware, rateLimiter, footerController.updateFooter);

router.delete('/deleteFooter/:id/:lang', authMiddleware, footerController.deleteFooter);

module.exports = router;
