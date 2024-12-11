const express = require('express');
const router = express.Router();
const userTypesController = require('../Controllers/UsersTypesController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.get('/getAllUsersTypes/:lang', authMiddleware, rateLimiter, userTypesController.getAllUserTypes);
router.get('/getAllUsersTypesByType/:lang/:type', authMiddleware, rateLimiter, userTypesController.getUsersByType);
router.get('/getAllChaletsOwners/:lang', authMiddleware, rateLimiter, userTypesController.getChaletOwners);
router.get('/getAllEventsOwners/:lang', authMiddleware, rateLimiter, userTypesController.getEventOwners);
router.get('/getAllLandsOwners/:lang', authMiddleware, rateLimiter, userTypesController.getLandOwners);
router.get('/getUsersTypesById/:id/:lang', authMiddleware, rateLimiter, userTypesController.getUserTypeById);
router.get('/getChaletOwnerById/:id/:lang', authMiddleware, rateLimiter, userTypesController.getChaletOwnerById);
router.get('/getEventOwnerById/:id/:lang', authMiddleware, rateLimiter, userTypesController.getEventOwnerById);
router.get('/getLandOwnerById/:id/:lang', authMiddleware, rateLimiter, userTypesController.getLandOwnerById);
router.post('/createUserType', authMiddleware, rateLimiter, userTypesController.createUserType);
router.put('/UpdateUserType/:id', authMiddleware, rateLimiter, userTypesController.updateUserType);
router.put('/UpdateChaletsOwner/:id', authMiddleware, rateLimiter, userTypesController.updateChaletOwner);
router.put('/UpdateEventOwner/:id', authMiddleware, rateLimiter, userTypesController.updateEventsOwner);
router.put('/UpdateLandOwner/:id', authMiddleware, rateLimiter, userTypesController.updateLandsOwner);
router.delete('/DeleteUserType/:id/:lang', authMiddleware, rateLimiter, userTypesController.deleteUserType);
router.delete('/DeleteChaletOwner/:id/:lang', authMiddleware, rateLimiter, userTypesController.deleteChaletOwner);
router.delete('/DeleteEventOwner/:id/:lang', authMiddleware, rateLimiter, userTypesController.deleteEventOwner);
router.delete('/DeleteLandOwner/:id/:lang', authMiddleware, rateLimiter, userTypesController.deleteLandOwner);

module.exports = router;
