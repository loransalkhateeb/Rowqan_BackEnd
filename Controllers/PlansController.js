const Plans = require('../Models/PlansModel');
const Available_Events = require('../Models/AvailableEvents');

exports.createPlan = async (req, res) => {
  try {
    const { plane_type, description_plan, lang, available_events_id } = req.body;

    const availableEvent = await Available_Events.findByPk(available_events_id);
    if (!availableEvent) {
      return res.status(404).json({ error: 'Available Event not found' });
    }

    const newPlan = await Plans.create({
      plane_type,
      description_plan,
      lang,
      available_events_id
    });

    res.status(201).json({
      message: lang === 'en' ? 'Plan created successfully' : 'تم إنشاء الخطة بنجاح',
      plan: newPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Plan' });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const { lang } = req.params;

    const plans = await Plans.findAll({ where: { lang } });

    if (plans.length === 0) {
      return res.status(404).json({ error: lang === 'en' ? 'No plans found' : 'لا توجد خطط' });
    }

    res.status(200).json({
      message: lang === 'en' ? 'Plans retrieved successfully' : 'تم استرجاع الخطط بنجاح',
      plans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve plans' });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const plan = await Plans.findOne({ where: { id, lang } });

    if (!plan) {
      return res.status(404).json({ error: lang === 'en' ? `Plan with ID ${id} not found` : `الخطة بالرقم ${id} غير موجودة` });
    }

    res.status(200).json({
      message: lang === 'en' ? 'Plan retrieved successfully' : 'تم استرجاع الخطة بنجاح',
      plan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve plan' });
  }
};

exports.updatePlan = async (req, res) => {
    try {
      const { id } = req.params;
      const { plane_type, description_plan, lang, available_events_id } = req.body;
  
      const plan = await Plans.findByPk(id);
      if (!plan) {
        return res.status(404).json({ error: lang === 'en' ? `Plan with ID ${id} not found` : `الخطة بالرقم ${id} غير موجودة` });
      }
  
      
      const availableEvent = await Available_Events.findByPk(available_events_id);
      if (!availableEvent) {
        return res.status(404).json({ error: lang === 'en' ? 'Available Event not found' : 'حدث متاح غير موجود' });
      }
  
    
      plan.plane_type = plane_type || plan.plane_type;
      plan.description_plan = description_plan || plan.description_plan;
      plan.available_events_id = available_events_id || plan.available_events_id;
      plan.lang = lang || plan.lang; 
  
      await plan.save();
  
      res.status(200).json({
        message: lang === 'en' ? 'Plan updated successfully' : 'تم تحديث الخطة بنجاح',
        plan
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update plan' });
    }
  };
  




exports.deletePlan = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const plan = await Plans.findOne({ where: { id, lang } });
    if (!plan) {
      return res.status(404).json({ error: lang === 'en' ? `Plan with ID ${id} not found` : `الخطة بالرقم ${id} غير موجودة` });
    }

    await plan.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Plan deleted successfully' : 'تم حذف الخطة بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};
