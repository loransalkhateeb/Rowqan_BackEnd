const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UsersController');


router.post('/createUser', userController.createUser);


router.get('/getAllUsers/:lang', userController.getAllUsers);


router.get('/getUserById/:id/:lang', userController.getUserById);


router.put('/UpdateUser/:id', userController.updateUser);


router.delete('/DeleteUser/:id/:lang', userController.deleteUser);


router.post('/login', userController.login);


router.post('/logout', userController.logout);


router.post('/createAdmin', userController.createAdmin);

module.exports = router;
