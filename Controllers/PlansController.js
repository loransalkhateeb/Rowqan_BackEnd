const Plans = require('../Models/PlansModel');
const Available_Events = require('../Models/AvailableEvents');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');


exports.createPlan = async (req, res) => {
    try {
        const { plane_type, description_plan, lang, price, available_event_id } = req.body;

      
        const validationErrors = validateInput({ plane_type, description_plan, lang, price, available_event_id });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

        
        let availableEvent = null;
        if (available_event_id) {
            availableEvent = await Available_Events.findByPk(available_event_id);
            if (!availableEvent) {
                return res.status(404).json(new ErrorResponse('Available Event not found.'));
            }
        }

      
        const newPlan = await Plans.create({
            plane_type,
            description_plan,
            lang,
            price,
            Available_Event_Id: available_event_id || null,
        });

        return res.status(201).json({
            message: 'Plan created successfully',
            plan: newPlan,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.getPlans = async (req, res) => {
    try {
        const { lang } = req.params;
        const plans = await Plans.findAll({
            where: { lang },
            include: { model: Available_Events, attributes: ['name'] }, // تضمين الحدث المتاح
        });

        if (!plans.length) {
            return res.status(404).json(new ErrorResponse('No plans found.'));
        }

        return res.status(200).json({
            message: 'Plans retrieved successfully',
            plans,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.getPlanById = async (req, res) => {
    try {
        const { id, lang } = req.params;

        const plan = await Plans.findOne({
            where: { id, lang },
            include: { model: Available_Events, attributes: ['name'] },
        });

        if (!plan) {
            return res.status(404).json(new ErrorResponse('Plan not found.'));
        }

        return res.status(200).json({
            message: 'Plan retrieved successfully',
            plan,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plane_type, description_plan, lang, price, available_event_id } = req.body;

      
        const plan = await Plans.findByPk(id);
        if (!plan) {
            return res.status(404).json(new ErrorResponse('Plan not found.'));
        }

        
        if (available_event_id) {
            const availableEvent = await Available_Events.findByPk(available_event_id);
            if (!availableEvent) {
                return res.status(404).json(new ErrorResponse('Available Event not found.'));
            }
        }

 
        await plan.update({
            plane_type,
            description_plan,
            lang,
            price,
            Available_Event_Id: available_event_id || null,
        });

        return res.status(200).json({
            message: 'Plan updated successfully',
            plan,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.deletePlan = async (req, res) => {
    try {
        const { id, lang } = req.params;

     
        const plan = await Plans.findOne({ where: { id, lang } });
        if (!plan) {
            return res.status(404).json(new ErrorResponse('Plan not found.'));
        }

     
        await plan.destroy();

        return res.status(200).json({
            message: 'Plan deleted successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.getPlanByAvailableEventId = async (req, res) => {
    try {
        const { available_events_id, lang } = req.params;

        const plans = await Plans.findAll({
            where: { Available_Event_Id: available_events_id, lang },
            include: { model: Available_Events, attributes: ['title'] },
        });

        if (!plans.length) {
            return res.status(404).json(new ErrorResponse('No plans found for the specified event.'));
        }

        return res.status(200).json({
            message: 'Plans retrieved successfully',
            plans,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};
