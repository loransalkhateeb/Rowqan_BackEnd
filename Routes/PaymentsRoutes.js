const express = require('express');
const router = express.Router();
const paymentsController = require('../Controllers/PaymentController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');

router.post('/createPayment', rateLimiter, paymentsController.createPayment);

router.post('/createPaymentIntent',rateLimiter, paymentsController.createPaymentIntent);


router.put('/updatePayment/:id', rateLimiter, paymentsController.updatePayment);

router.get('/getPayments',rateLimiter, paymentsController.getPayments);

router.get('/getPaymentById/:id', rateLimiter, paymentsController.getPaymentById);

router.delete('/deletePayment', rateLimiter, paymentsController.deletePayment);


module.exports = router;