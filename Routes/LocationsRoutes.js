const express = require('express');
const router = express.Router();
const locationController = require('../Controllers/LocationController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/create', authMiddleware, rateLimiter, locationController.createLocation);

router.get('/', locationController.getAllLocations);

router.get('/:id/:lang', locationController.getLocationById);

router.put('/update/:id', authMiddleware, rateLimiter, locationController.updateLocation);

router.delete('/delete/:id', authMiddleware, locationController.deleteLocation);

router.get('/chalet/:chalet_id/:lang', locationController.getLocationsByChaletId);

module.exports = router;
