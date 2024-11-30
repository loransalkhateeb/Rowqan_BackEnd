const express = require('express');
const router = express.Router();
const statusController = require('../Controllers/StatusController');

router.post('/createstatus', statusController.createStatus);

router.get('/getallstatuses', statusController.getAllStatuses);

router.get('/getstatusbyid/:id', statusController.getStatusById);

router.put('/updatestatus/:id', statusController.updateStatus);

router.delete('/deletestatus/:id', statusController.deleteStatus);

module.exports = router;
