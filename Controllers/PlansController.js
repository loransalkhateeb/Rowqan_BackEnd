const Plans = require('../Models/PlansModel');
const Available_Events = require('../Models/AvailableEvents');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')

exports.createPlan = async (req, res) => {
    try {
        const { plane_type, description_plan, lang, price, available_event_id } = req.body;

      
        const validationErrors = validateInput({ plane_type, description_plan, lang, price, available_event_id });
        if (validationErrors.length > 0) {
            return res.status(400).json( ErrorResponse('Validation failed', validationErrors));
        }

        
        let availableEvent = null;
        if (available_event_id) {
            availableEvent = await Available_Events.findByPk(available_event_id);
            if (!availableEvent) {
                return res.status(404).json( ErrorResponse('Available Event not found.'));
            }
        }

      
        const newPlan = await Plans.create({
            plane_type,
            description_plan,
            lang,
            price,
            Available_Event_Id: available_event_id || null,
        });

        return res.status(201).json(
            newPlan,
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json( ErrorResponse('Internal server error'));
    }
};


exports.getPlans = async (req, res) => {
    try {
      const { lang } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
  
      const cacheKey = `plans:lang:${lang}:page:${page}:limit:${limit}`;
      const cachedData = await client.get(cacheKey);
  
      if (cachedData) {
        return res.status(200).json(
          JSON.parse(cachedData),
        );
      }
  
      const plans = await Plans.findAll({
        where: { lang },
        include: {
          model: Available_Events,
          attributes: ['title'], 
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["id", "DESC"]], 
      });
  
      if (!plans.length) {
        return res.status(404).json({
          message: 'No plans found.',
        });
      }
  
      await client.setEx(cacheKey, 3600, JSON.stringify(plans));
  
      return res.status(200).json(
       plans,
      );
    } catch (error) {
      console.error("Error in getPlans:", error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  


  exports.getPlanById = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      const cacheKey = `plan:${id}:lang:${lang}`;
  
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit for plan:", id);
        return res.status(200).json(
          JSON.parse(cachedData),
        );
      }
      console.log("Cache miss for plan:", id);
  

      const plan = await Plans.findOne({
        where: { id, lang },
        include: {
          model: Available_Events,
          attributes: ['title'],
        },
      });
  
      if (!plan) {
        return res.status(404).json( ErrorResponse('Plan not found.'));
      }
  
      await client.setEx(cacheKey, 3600, JSON.stringify(plan));
  
      return res.status(200).json(
        plan,
      );
    } catch (error) {
      console.error("Error in getPlanById:", error);
  
      return res.status(500).json(
         ErrorResponse('Failed to fetch Plan entry', [
          'An internal server error occurred. Please try again later.',
        ])
      );
    }
  };
  




exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plane_type, description_plan, lang, price, available_event_id } = req.body;

      
        const plan = await Plans.findByPk(id);
        if (!plan) {
            return res.status(404).json( ErrorResponse('Plan not found.'));
        }

        
        if (available_event_id) {
            const availableEvent = await Available_Events.findByPk(available_event_id);
            if (!availableEvent) {
                return res.status(404).json( ErrorResponse('Available Event not found.'));
            }
        }

 
        await plan.update({
            plane_type,
            description_plan,
            lang,
            price,
            Available_Event_Id: available_event_id || null,
        });

        return res.status(200).json(
           
            plan,
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json( ErrorResponse('Internal server error'));
    }
};


exports.deletePlan = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      
      const [plan, _] = await Promise.all([
        Plans.findOne({ where: { id, lang } }),
        client.del(`plan:${id}:${lang}`),  
      ]);
  
      if (!plan) {
        return res.status(404).json( ErrorResponse('Plan not found.'));
      }
  
      await plan.destroy();
  
     
      return res.status(200).json({
        message: 'Plan deleted successfully',
      });
    } catch (error) {
      console.error("Error in deletePlan:", error);
  

      return res.status(500).json( ErrorResponse('Internal server error'));
    }
  };
  




exports.getPlanByAvailableEventId = async (req, res) => {
    try {
      const { available_events_id, lang } = req.params;
  
      const cacheKey = `plans:available_event:${available_events_id}:lang:${lang}`;
  
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit for plans:", available_events_id);
        return res.status(200).json(
          JSON.parse(cachedData),
        );
      }
      console.log("Cache miss for plans:", available_events_id);
  
      const plans = await Plans.findAll({
        where: { Available_Event_Id: available_events_id, lang },
        include: { model: Available_Events, attributes: ['title', 'price'] },
      });
  
      if (!plans.length) {
        return res.status(404).json( ErrorResponse('No plans found for the specified event.'));
      }
  
      await client.setEx(cacheKey, 3600, JSON.stringify(plans));
  
      return res.status(200).json(
        plans,
      );
    } catch (error) {
      console.error("Error in getPlanByAvailableEventId:", error);
  
      return res.status(500).json( ErrorResponse('Internal server error'));
    }
  };
  
