const express = require('express');
const router = express.Router();
const PlansController = require('../Controllers/PlansController');


router.post('/createplane', PlansController.createPlan);


router.get('/getAllPlans/:lang', PlansController.getPlans);


router.get('/getPlanById/:id/:lang', PlansController.getPlanById);


router.put('/updateplane/:id', PlansController.updatePlan);

router.delete('/deletePlane/:id/:lang', PlansController.deletePlan);

module.exports = router;
