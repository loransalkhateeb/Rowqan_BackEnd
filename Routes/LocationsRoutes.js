const express = require('express');
const router = express.Router();
const locationController = require('../Controllers/LocationController');


router.post('/create', locationController.createLocation);


router.get('/', locationController.getAllLocations);


router.get('/:id/:lang', locationController.getLocationById);


router.put('/update/:id', locationController.updateLocation);


router.delete('/delete/:id', locationController.deleteLocation);


router.get('/chalet/:chalet_id/:lang', locationController.getLocationsByChaletId);

module.exports = router;
