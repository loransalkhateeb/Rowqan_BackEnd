const express = require('express');
const router = express.Router();
const BreifDetailsChaletsController = require('../Controllers/BreifDetailsChaletsController');


router.post('/createBreif', BreifDetailsChaletsController.createBreifDetailsChalet);


router.get('/getBreifsByChaletId/:chalet_id/:lang', BreifDetailsChaletsController.getBreifDetailsByChaletId);


router.get('/getById/:id/:lang', BreifDetailsChaletsController.getBreifDetailsById);


router.put('/updateBreif/:id', BreifDetailsChaletsController.updateBreifDetailsChalet);


router.delete('/deleteBreif/:id/:lang', BreifDetailsChaletsController.deleteBreifDetailsChalet);

module.exports = router;
