const express = require('express');
const router = express.Router();
const plansController = require('../Controllers/plansController');
const authMiddleware = require('../MiddleWares/authMiddleware');
const rateLimiter = require('../MiddleWares/rateLimiter');


router.post('/createplan', authMiddleware, rateLimiter, plansController.createPlan); 

router.get('/plans/:lang', authMiddleware, plansController.getPlans);


router.get('/plans/:id/:lang', authMiddleware, plansController.getPlanById);


router.put('/plans/:id', authMiddleware, rateLimiter, plansController.updatePlan);

router.delete('/plans/:id/:lang', authMiddleware, plansController.deletePlan);

router.get('/plans/event/:available_events_id/:lang', authMiddleware, plansController.getPlanByAvailableEventId);

module.exports = router;
