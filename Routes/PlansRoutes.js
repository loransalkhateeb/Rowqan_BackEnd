const express = require('express');
const router = express.Router();
const plansController = require('../Controllers/plansController');

router.post('/createplan', plansController.createPlan); 
router.get('/plans/:lang', plansController.getPlans); 
router.get('/plans/:id/:lang', plansController.getPlanById); 
router.put('/plans/:id', plansController.updatePlan);
router.delete('/plans/:id/:lang', plansController.deletePlan); 
router.get('/plans/event/:available_events_id/:lang', plansController.getPlanByAvailableEventId); 

module.exports = router;
