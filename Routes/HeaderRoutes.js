const express = require('express');
const router = express.Router();
const headerController = require('../Controllers/HeaderController');

router.post('/createHeader', headerController.createHeader);


router.get('/getAllHeaders/:lang', headerController.getAllHeaders);

router.get('/getHeaderById/:id/:lang', headerController.getHeaderById);


router.put('/updateHeader/:id', headerController.updateHeader);


router.delete('/deleteHeader/:id/:lang', headerController.deleteHeader);

module.exports = router;
