const express = require('express');
const router = express.Router();
const breifLandsController = require('../Controllers/BreifLandsController');

router.post('/createbreiflands', breifLandsController.createBreifLand);
router.get('/getbreiflands/:category_id', breifLandsController.getAllBreifLandsByCategory);
router.get('/getbreiflandbyid/:id', breifLandsController.getBreifLandById);
router.put('/updatebreifland/:id', breifLandsController.updateBreifLand);
router.delete('/deletebreifland/:id/:lang', breifLandsController.deleteBreifLand);

module.exports = router;
