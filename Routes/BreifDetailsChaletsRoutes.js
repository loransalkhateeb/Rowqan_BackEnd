const express = require('express');
const router = express.Router();
const BreifDetailsChaletsController = require('../Controllers/BreifDetailsChaletsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createBreif', authMiddleware, rateLimiter, BreifDetailsChaletsController.createBreifDetailsChalet);
router.put('/updateBreif/:id', authMiddleware, rateLimiter, BreifDetailsChaletsController.updateBreifDetailsChalet);


router.get('/getBreifsByChaletId/:chalet_id/:lang', authMiddleware, BreifDetailsChaletsController.getBreifDetailsByChaletId);
router.get('/getById/:id/:lang', authMiddleware, BreifDetailsChaletsController.getBreifDetailsById);
router.delete('/deleteBreif/:id/:lang', authMiddleware, BreifDetailsChaletsController.deleteBreifDetailsChalet);

module.exports = router;
