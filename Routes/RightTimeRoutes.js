const express = require('express');
const router = express.Router();
const rightTimeController = require('../Controllers/RightTimeController'); 
const multer = require('../Config/Multer'); 


router.post('/createrighttime', multer.single('image'), rightTimeController.createRightTime);


router.get('/getallrighttimes/:lang', rightTimeController.getAllRightTimes);
router.get('/getallrighttimes/:lang/chalet_id', rightTimeController.getAllRightTimesByChaletId);


router.get('/getrighttimebyid/:id/:lang', rightTimeController.getRightTimeById);


router.put('/updaterighttime/:id', multer.single('image'), rightTimeController.updateRightTime);


router.delete('/deleterighttime/:id/:lang', rightTimeController.deleteRightTime);

module.exports = router;
