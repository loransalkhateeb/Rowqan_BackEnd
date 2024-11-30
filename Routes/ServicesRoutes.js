const express = require('express');
const router = express.Router();
const servicesController = require('../Controllers/ServicesController'); 
const multer = require('../Config/Multer'); 


router.post('/createService', multer.single('image'), servicesController.createService);


router.get('/getAllServices/:lang', servicesController.getAllServices);
router.get('/getAllServicesByServiceStatus/:lang', servicesController.getServiceByStatus);
router.get('/getservicebyid/:id/:lang', servicesController.getServiceById);


router.put('/updateService/:id', multer.single('image'), servicesController.updateService);


router.delete('/deleteService/:id/:lang', servicesController.deleteService);

module.exports = router;
