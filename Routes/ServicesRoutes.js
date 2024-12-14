const express = require('express');
const router = express.Router();
const servicesController = require('../Controllers/ServicesController'); 
const multer = require('../Config/Multer'); 
const authMiddleware = require('../MiddleWares/authMiddleware'); 
const rateLimiter = require('../MiddleWares/rateLimiter');

// router.use(authMiddleware);

router.post('/createService', rateLimiter, multer.single('image'), servicesController.createService);

router.get('/getAllServices/:lang', servicesController.getAllServices);

router.get('/getAllServicesByServiceStatus/:status_service/:lang', servicesController.getServiceByStatus);


router.get('/getAllServicesByServiceStatus/:lang', servicesController.getServiceByStatusOnlyLang);


router.get('/getservicebyid/:id/:lang', servicesController.getServiceById);


router.put('/updateService/:id', rateLimiter, multer.single('image'), servicesController.updateService);


router.delete('/deleteService/:id/:lang', servicesController.deleteService);

module.exports = router;
