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
// API to get user ID
router.get('/verifytoken',userController.verifyToken, (req, res) => {
    const userId = req.user.id; // The user ID from the JWT token's payload
    res.status(200).json({ userId });
  });
module.exports = router;
