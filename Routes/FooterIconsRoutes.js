const express = require('express');
const router = express.Router();
const footerIconsController = require('../Controllers/FooterIconsController');
const multer = require('../Config/Multer'); 
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createFooterIcon', authMiddleware, rateLimiter, multer.single('icon'), footerIconsController.createFooterIcon);

router.get('/getAllFooterIcons', footerIconsController.getAllFooterIcons);

router.get('/getFooterIconById/:id', footerIconsController.getFooterIconById);

router.put('/updateFooterIcon/:id', authMiddleware, rateLimiter, multer.single('icon'), footerIconsController.updateFooterIcon);

router.delete('/deleteFooterIcon/:id', authMiddleware, footerIconsController.deleteFooterIcon);

module.exports = router;
