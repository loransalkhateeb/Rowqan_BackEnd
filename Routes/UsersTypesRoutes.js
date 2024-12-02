const express = require('express');
const router = express.Router();
const userTypesController = require('../Controllers/UsersTypesController');

router.get('/getAllUsersTypes/:lang', userTypesController.getAllUserTypes);
router.get('/getAllUsersTypesByType/:lang/:type', userTypesController.getUsersByType);
router.get('/getAllChaletsOwners/:lang', userTypesController.getChaletOwners);
router.get('/getAllEventsOwners/:lang', userTypesController.getEventOwners);
router.get('/getUsersTypesById/:id/:lang', userTypesController.getUserTypeById); 
router.get('/getChaletOwnerById/:id/:lang', userTypesController.getChaletOwnerById); 
router.get('/getEventOwnerById/:id/:lang', userTypesController.getEventOwnerById); 
router.post('/createUserType', userTypesController.createUserType);
router.put('/UpdateUserType/:id', userTypesController.updateUserType); 
router.put('/UpdateChaletsOwner/:id', userTypesController.updateChaletOwner); 
router.put('/UpdateEventOwner/:id', userTypesController.updateEventsOwner); 
router.put('/UpdateLandOwner/:id', userTypesController.updateLandsOwner); 
router.delete('/DeleteUserType/:id/:lang', userTypesController.deleteUserType); 
router.delete('/DeleteChaletOwner/:id/:lang', userTypesController.deleteChaletOwner); 

module.exports = router;
