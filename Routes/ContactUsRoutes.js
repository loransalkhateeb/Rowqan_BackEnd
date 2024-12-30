const express = require('express');
const router = express.Router();
const ContactUsController = require('../Controllers/ContactUsController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createcontactus', rateLimiter, multer.single('image'), ContactUsController.createContactUs);
router.put('/updatecontactus/:id', rateLimiter, multer.single('image'), ContactUsController.updateContactUs);


router.get('/getcontactusid/:id/:lang', ContactUsController.getContactUsById);
router.get('/getAllContactUs/:lang', ContactUsController.getALLContactUs);


router.delete('/deletecontactus/:id/:lang', ContactUsController.deleteContactUs);

module.exports = router;
