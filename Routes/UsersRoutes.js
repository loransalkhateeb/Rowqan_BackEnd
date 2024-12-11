const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UsersController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.post('/createUser', rateLimiter, userController.createUser);

router.get('/getAllUsers/:lang', authMiddleware, rateLimiter, userController.getAllUsers);

router.get('/getUserById/:id/:lang', authMiddleware, rateLimiter, userController.getUserById);

router.put('/UpdateUser/:id', authMiddleware, rateLimiter, userController.updateUser);

router.delete('/DeleteUser/:id/:lang', authMiddleware, rateLimiter, userController.deleteUser);

router.post('/login', rateLimiter, userController.login);

router.post('/logout', authMiddleware, rateLimiter, userController.logout);

router.post('/createAdmin', authMiddleware, rateLimiter, userController.createAdmin);

module.exports = router;
