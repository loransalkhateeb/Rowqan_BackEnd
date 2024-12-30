const express = require('express');
const router = express.Router();
const BreifDetailsChaletsController = require('../Controllers/BreifDetailsChaletsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createBreif', rateLimiter, BreifDetailsChaletsController.createBreifDetailsChalet);
router.put('/updateBreif/:id', rateLimiter, BreifDetailsChaletsController.updateBreifDetailsChalet);


router.get('/getBreifsByChaletId/:chalet_id/:lang', BreifDetailsChaletsController.getBreifDetailsByChaletId);
router.get('/getById/:id/:lang', BreifDetailsChaletsController.getBreifDetailsById);
router.delete('/deleteBreif/:id/:lang', BreifDetailsChaletsController.deleteBreifDetailsChalet);

module.exports = router;
