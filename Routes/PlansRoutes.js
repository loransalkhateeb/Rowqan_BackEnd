const express = require('express');
const router = express.Router();
const plansController = require('../Controllers/PlansController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');
router.post('/createplan', rateLimiter, plansController.createPlan); 

router.get('/getAllplans/:lang', plansController.getPlans);


router.get('/getPlanById/:id/:lang', plansController.getPlanById);


router.put('/UpdatePlan/:id', rateLimiter, plansController.updatePlan);

router.delete('/deletePlan/:id/:lang', plansController.deletePlan);

router.get('/planevents/:available_events_id/:lang', plansController.getPlanByAvailableEventId);

module.exports = router;
