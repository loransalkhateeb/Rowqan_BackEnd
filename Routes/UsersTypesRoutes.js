const express = require('express');
const router = express.Router();
const userTypesController = require('../Controllers/UsersTypesController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.get('/getAllUsersTypes/:lang', rateLimiter, userTypesController.getAllUserTypes);
router.get('/getAllUsersTypesByType/:lang/:type', authMiddleware, rateLimiter, userTypesController.getUsersByType);
router.get('/getAllChaletsOwners/:lang', rateLimiter, userTypesController.getChaletOwners);
router.get('/getAllEventsOwners/:lang',  rateLimiter, userTypesController.getEventOwners);
router.get('/getAllLandsOwners/:lang',  rateLimiter, userTypesController.getLandOwners);
router.get('/getUsersTypesById/:id/:lang', rateLimiter, userTypesController.getUserTypeById);
router.get('/getChaletOwnerById/:id/:lang', rateLimiter, userTypesController.getChaletOwnerById);
router.get('/getEventOwnerById/:id/:lang', rateLimiter, userTypesController.getEventOwnerById);
router.get('/getLandOwnerById/:id/:lang', rateLimiter, userTypesController.getLandOwnerById);
router.post('/createUserType', rateLimiter, userTypesController.createUserType);
router.put('/UpdateUserType/:id', rateLimiter, userTypesController.updateUserType);
router.put('/UpdateChaletsOwner/:id', rateLimiter, userTypesController.updateChaletOwner);
router.put('/UpdateEventOwner/:id', rateLimiter, userTypesController.updateEventsOwner);
router.put('/UpdateLandOwner/:id', rateLimiter, userTypesController.updateLandsOwner);
router.delete('/DeleteUserType/:id/:lang', rateLimiter, userTypesController.deleteUserType);
router.delete('/DeleteChaletOwner/:id/:lang', rateLimiter, userTypesController.deleteChaletOwner);
router.delete('/DeleteEventOwner/:id/:lang', rateLimiter, userTypesController.deleteEventOwner);
router.delete('/DeleteLandOwner/:id/:lang', rateLimiter, userTypesController.deleteLandOwner);

module.exports = router;
