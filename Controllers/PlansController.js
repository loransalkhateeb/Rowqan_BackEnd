const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const Plans = require('../Models/PlansModel');
const Available_Events = require('../Models/AvailableEvents');

exports.createPlan = async (req, res) => {
  try {
    const { plane_type, description_plan, lang, available_events_id } = req.body;

   
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    let availableEvent = null;
    if (available_events_id !== null && available_events_id !== undefined) {
      availableEvent = await Available_Events.findByPk(available_events_id);
      if (!availableEvent) {
        return res.status(404).json({
          error: ErrorResponse(lang, 'Available Event not found', 'حدث متاح غير موجود'),
        });
      }
    }

    const newPlan = await Plans.create({
      plane_type,
      description_plan,
      lang,
      Avialable_Event_Id: available_events_id || null,
    });

    res.status(201).json({
      message: ErrorResponse(lang, 'Plan created successfully', 'تم إنشاء الخطة بنجاح'),
      plan: newPlan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to create Plan', 'فشل في إنشاء الخطة') });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const { lang } = req.params;

  
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    const plans = await Plans.findAll({
      where: { lang },
      include: [{
        model: Available_Events,
        as: 'Available_Events',
      }],
    });

    if (plans.length === 0) {
      return res.status(404).json({
        error: ErrorResponse(lang, 'No plans found', 'لا توجد خطط'),
      });
    }

    res.status(200).json({
      message: ErrorResponse(lang, 'Plans retrieved successfully', 'تم استرجاع الخطط بنجاح'),
      plans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to retrieve plans', 'فشل في استرجاع الخطط') });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const { id, lang } = req.params;

  
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    const plan = await Plans.findOne({
      where: { id, lang },
      include: [{
        model: Available_Events,
        as: 'Available_Events',
      }],
    });

    if (!plan) {
      return res.status(404).json({
        error: ErrorResponse(lang, `Plan with ID ${id} not found`, `الخطة بالرقم ${id} غير موجودة`),
      });
    }

    res.status(200).json({
      message: ErrorResponse(lang, 'Plan retrieved successfully', 'تم استرجاع الخطة بنجاح'),
      plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to retrieve plan', 'فشل في استرجاع الخطة') });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plane_type, description_plan, lang, available_events_id } = req.body;

 
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    const plan = await Plans.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        error: ErrorResponse(lang, `Plan with ID ${id} not found`, `الخطة بالرقم ${id} غير موجودة`),
      });
    }

    let availableEvent = null;
    if (available_events_id !== null && available_events_id !== undefined) {
      availableEvent = await Available_Events.findByPk(available_events_id);
      if (!availableEvent) {
        return res.status(404).json({
          error: ErrorResponse(lang, 'Available Event not found', 'حدث متاح غير موجود'),
        });
      }
    }

    plan.plane_type = plane_type || plan.plane_type;
    plan.description_plan = description_plan || plan.description_plan;
    plan.lang = lang || plan.lang;
    plan.Avialable_Event_Id = available_events_id || plan.Avialable_Event_Id;

    await plan.save();

    res.status(200).json({
      message: ErrorResponse(lang, 'Plan updated successfully', 'تم تحديث الخطة بنجاح'),
      plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to update plan', 'فشل في تحديث الخطة') });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id, lang } = req.params;

 
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    const plan = await Plans.findOne({ where: { id, lang } });
    if (!plan) {
      return res.status(404).json({
        error: ErrorResponse(lang, `Plan with ID ${id} not found`, `الخطة بالرقم ${id} غير موجودة`),
      });
    }

    await plan.destroy();

    res.status(200).json({
      message: ErrorResponse(lang, 'Plan deleted successfully', 'تم حذف الخطة بنجاح'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to delete plan', 'فشل في حذف الخطة') });
  }
};

exports.getPlanByAvailableEventId = async (req, res) => {
  try {
    const { available_events_id, lang } = req.params;

    
    const languageValidation = validateInput(lang, ['ar', 'en']);
    if (!languageValidation.isValid) {
      return res.status(400).json({ error: ErrorResponse(lang, 'Invalid language', 'اللغة غير صالحة') });
    }

    const plans = await Plans.findAll({
      where: { Avialable_Event_Id: available_events_id, lang },
      include: [{
        model: Available_Events,
        as: 'Available_Event',
      }],
    });

    if (plans.length === 0) {
      return res.status(404).json({
        error: ErrorResponse(lang, `No plans found for Available Event with ID ${available_events_id}`, `لا توجد خطط لحدث متاح بالرقم ${available_events_id}`),
      });
    }

    res.status(200).json({
      message: ErrorResponse(lang, 'Plans for Available Event retrieved successfully', 'تم استرجاع الخطط للحدث المتاح بنجاح'),
      plans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: ErrorResponse(lang, 'Failed to retrieve plans for available event', 'فشل في استرجاع الخطط للحدث المتاح') });
  }
};
