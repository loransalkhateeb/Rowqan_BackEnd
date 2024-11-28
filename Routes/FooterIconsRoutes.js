const express = require('express');
const router = express.Router();
const footerIconsController = require('../Controllers/FooterIconsController');
const multer = require('../Config/Multer'); 

router.post('/createFooterIcon', multer.single('icon'), footerIconsController.createFooterIcon);


router.get('/getAllFooterIcons', footerIconsController.getAllFooterIcons);


router.get('/getFooterIconById/:id', footerIconsController.getFooterIconById);


router.put('/updateFooterIcon/:id',multer.single('icon'), footerIconsController.updateFooterIcon);


router.delete('/deleteFooterIcon/:id', footerIconsController.deleteFooterIcon);

module.exports = router;
