const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UsersController');
// const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

router.post('/createUser', rateLimiter, userController.createUser);

router.get('/getAllUsers/:lang',rateLimiter, userController.getAllUsers);

router.get('/getUserById/:id/:lang', rateLimiter, userController.getUserById);

router.put('/UpdateUser/:id', rateLimiter, userController.updateUser);

router.delete('/DeleteUser/:id/:lang',  rateLimiter, userController.deleteUser);

router.post('/login', rateLimiter, userController.login);

router.post('/logout', rateLimiter, userController.logout);

router.post('/createAdmin', userController.createAdmin);
router.get('/verifytoken',userController.verifyToken, (req, res) => {
    const userId = req.user.id; // The user ID from the JWT token's payload
    res.status(200).json({ userId });
  });
module.exports = router;
