const express = require('express');
const router = express.Router();
const plansController = require('../Controllers/plansController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');
router.post('/createplan', authMiddleware, rateLimiter, plansController.createPlan); 

router.get('/plans/:lang', plansController.getPlans);


router.get('/plans/:id/:lang', plansController.getPlanById);


router.put('/plans/:id', rateLimiter, plansController.updatePlan);

router.delete('/plans/:id/:lang', authMiddleware, plansController.deletePlan);

router.get('/plans/event/:available_events_id/:lang', plansController.getPlanByAvailableEventId);

module.exports = router;
