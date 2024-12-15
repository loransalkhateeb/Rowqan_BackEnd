const express = require('express');
const router = express.Router();
const statusController = require('../Controllers/StatusController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');

// router.use(authMiddleware);

router.post('/createstatus', rateLimiter, statusController.createStatus);

router.get('/getallstatuses/:lang', statusController.getAllStatuses);

router.get('/getstatusbyid/:id', statusController.getStatusById);

router.put('/updatestatus/:id', rateLimiter, statusController.updateStatus);

router.delete('/deletestatus/:id', statusController.deleteStatus);

module.exports = router;
