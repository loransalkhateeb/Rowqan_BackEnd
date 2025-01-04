const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UsersController');
// const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');
const { register, login, logout, resetPassword ,requestPasswordReset } = require('../MiddleWares/verifyJWT.js');
const rateLimit = require('express-rate-limit');


const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many password reset requests from this IP, please try again after 15 minutes.',
  standardHeaders: true, 
  legacyHeaders: false,
});


router.post('/createUser', rateLimiter, userController.createUser);

router.post('/register',rateLimiter, register);


router.post('/forgot-password', passwordResetLimiter,requestPasswordReset);


router.get('/getAllUsers/:lang',rateLimiter, userController.getAllUsers);

router.get('/getUserById/:id/:lang', rateLimiter, userController.getUserById);

router.put('/UpdateUser/:id', rateLimiter, userController.updateUser);
router.post('/reset-password/:token',resetPassword);


router.delete('/DeleteUser/:id/:lang',  rateLimiter, userController.deleteUser);

router.post('/login', rateLimiter, login);


router.post('/logout', rateLimiter, logout);


router.post('/createAdmin', userController.createAdmin);
router.get('/verifytoken',userController.verifyToken, (req, res) => {
    const userId = req.user.id; 
    res.status(200).json({ userId });
  });
module.exports = router;
