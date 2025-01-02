const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const Types_Events = require('../Models/TypesEventsModel');

exports.createEventType = async (req, res) => {
  try {
    const { event_type, lang } = req.body;

  
    const validationErrors = validateInput({ event_type, lang });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

    const newEventType = await Types_Events.create({
      event_type,
      lang,
    });

    res.status(201).json(
      newEventType,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create event type'));
  }
};

exports.getAllEventTypes = async (req, res) => {
  try {
    const { lang, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const cacheKey = `eventTypes:page:${page}:limit:${limit}:lang:${lang || 'all'}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    const whereClause = lang ? { lang } : {};

   
    const eventTypes = await Types_Events.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

   
    if (!eventTypes.length) {
      return res.status(404).json(new ErrorResponse('No event types found'));
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(eventTypes));


    res.status(200).json(
      eventTypes,
    );
  } catch (error) {
    console.error("Error in getAllEventTypes:", error.message);
    res.status(500).json(
      new ErrorResponse("Failed to fetch event types", [
        "An internal server error occurred.",
      ])
    );
  }
};


exports.getEventTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

  
    const cacheKey = `eventType:${id}:lang:${lang || 'not_provided'}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for event type:", id);
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for event type:", id);

    
    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json(new ErrorResponse('Invalid language'));
      }
      whereClause.lang = lang;
    }

   
    const eventType = await Types_Events.findOne({
      where: whereClause,
    });

    
    if (!eventType) {
      return res.status(404).json(new ErrorResponse(`Event type with id ${id} and language ${lang || 'not provided'} not found`));
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(eventType));

  
    res.status(200).json(eventType);
  } catch (error) {
    console.error("Error in getEventTypeById:", error);
    res.status(500).json(new ErrorResponse('Failed to fetch event type'));
  }
};


exports.updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_type, lang } = req.body;

    const eventType = await Types_Events.findByPk(id);

    if (!eventType) {
      return res.status(404).json(new ErrorResponse(`Event type with id ${id} not found`));
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    eventType.event_type = event_type || eventType.event_type;
    eventType.lang = lang || eventType.lang;

    await eventType.save();

    res.status(200).json({ message: 'Event type updated successfully', eventType });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update event type'));
  }
};

exports.deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const [eventType, _] = await Promise.all([
      Types_Events.findByPk(id),
      client.del(`eventType:${id}`),
    ]);

    if (!eventType) {
      return res.status(404).json(
        ErrorResponse("Event type not found", [
          `No event type found with the given ID ${id}.`,
        ])
      );
    }

    await eventType.destroy();

    return res.status(200).json({ message: "Event type deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEventType:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete event type", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

