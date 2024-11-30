const express = require('express');
const router = express.Router();
const ContactUsController = require('../Controllers/ContactUsController');
const multer = require('../Config/Multer')

router.post('/createcontactus',multer.single('image'), ContactUsController.createContactUs);


router.put('/updatecontactus/:id', multer.single('image'),ContactUsController.updateContactUs);


router.get('/getcontactusid/:id/:lang', ContactUsController.getContactUsById);


router.delete('/deletecontactus/:id/:lang', ContactUsController.deleteContactUs);

module.exports = router;
