const express = require('express');
const router = express.Router();
const footerController = require('../Controllers/FooterController');


router.post('/createFooter', footerController.createFooter);


router.get('/getAllFooters/:lang', footerController.getAllFooters);


router.get('/getFooterById/:id/:lang', footerController.getFooterById);


router.put('/updateFooter/:id', footerController.updateFooter);


router.delete('/deleteFooter/:id/:lang', footerController.deleteFooter);

module.exports = router;
