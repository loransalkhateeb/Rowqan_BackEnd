const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const Sub_Events = require('../Models/SubEventsModel');
const Types_Events = require('../Models/TypesEventsModel');

exports.createSubEvent = async (req, res) => {
  try {
    const { title, date, time, lang, event_id } = req.body;
    const image = req.file ? req.file.filename : null;

 
    const validationErrors = validateInput({ title, date, time, lang, event_id, image });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

    const event = await Types_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json(new ErrorResponse(`Event with ID ${event_id} not found.`));
    }

    const subEvent = await Sub_Events.create({
      title,
      image,
      date,
      time,
      lang,
      event_id,
    });

    res.status(201).json(
       subEvent,
  );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create sub event'));
  }
};

exports.getSubEventsById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `subevent:${id}`;


    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for subevent:", id);
      return res.status(200).json(
      JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for subevent:", id);

  
    const subEvent = await Sub_Events.findOne({
      attributes: ["id", "title", "descr", "date", "location"], 
      where: { id },
    });

    if (!subEvent) {
      return res.status(404).json(
        new ErrorResponse("Sub Event not found", [
          "No Sub Event found with the given ID.",
        ])
      );
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(subEvent));

  
    return res.status(200).json(subEvent);
  } catch (error) {
    console.error("Error in getSubEventsById:", error);

  
    return res.status(500).json(
      new ErrorResponse("Failed to fetch Sub Event", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};






exports.getAllSubEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query; 
    const offset = (page - 1) * limit; 
    const cacheKey = `subevents:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey); 
    if (cachedData) {
      
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }

   
    const subEvents = await Sub_Events.findAll({
      attributes: ["id", "title", "descr", "date", "location"],
      order: [["id", "DESC"]], 
      limit: parseInt(limit), 
      offset: parseInt(offset), 
    });

   
    if (!subEvents.length) {
      return res.status(404).json(new ErrorResponse("No Sub Events found"));
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(subEvents));

   
    res.status(200).json(
       subEvents,
    );
  } catch (error) {
    console.error("Error in getAllSubEvents:", error.message);

  
    res.status(500).json(
      new ErrorResponse("Failed to fetch Sub Events", [
        "An internal server error occurred.",
      ])
    );
  }
};



exports.getSubEventsByEventId = async (req, res) => {
  try {
    const { event_id, lang } = req.params;

    const cacheKey = `subevents:event_id:${event_id}:lang:${lang}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for subevents:", event_id, lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    console.log("Cache miss for subevents:", event_id, lang);

    
    const event = await Types_Events.findOne({ where: { id: event_id, lang } });

    if (!event) {
      return res.status(404).json(new ErrorResponse(`Event with ID ${event_id} and language ${lang} not found.`));
    }

  
    const subEvents = await Sub_Events.findAll({
      where: { event_id },
      include: {
        model: Types_Events,
        where: { id: event_id, lang },
      },
    });

    if (subEvents.length === 0) {
      return res.status(404).json(new ErrorResponse('No sub events found for this event and language.'));
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(subEvents));

    res.status(200).json(subEvents);
  } catch (error) {
    console.error("Error in getSubEventsByEventId:", error);
    res.status(500).json(new ErrorResponse('Failed to retrieve sub events'));
  }
};


exports.updateSubEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, lang, event_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const subEvent = await Sub_Events.findByPk(id);
    if (!subEvent) {
      return res.status(404).json(new ErrorResponse(`Sub Event with ID ${id} not found.`));
    }

    const event = await Types_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json(new ErrorResponse(`Event with ID ${event_id} not found.`));
    }

  
    const validationErrors = validateInput({ title, date, time, lang, event_id, image });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    subEvent.title = title || subEvent.title;
    subEvent.date = date || subEvent.date;
    subEvent.time = time || subEvent.time;
    subEvent.lang = lang || subEvent.lang;
    subEvent.event_id = event_id || subEvent.event_id;
    subEvent.image = image || subEvent.image;

    await subEvent.save();

    res.status(200).json(
     subEvent,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update sub event'));
  }
};

exports.deleteSubEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const [subEvent, _] = await Promise.all([
      Sub_Events.findOne({ where: { id, lang } }),
      client.del(`subevent:${id}:${lang}`), 
    ]);

    if (!subEvent) {
      return res.status(404).json(new ErrorResponse(`Sub Event with ID ${id} not found.`));
    }

   
    await subEvent.destroy();

   
    return res.status(200).json({ message: "Sub Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSubEvent:", error);


    return res.status(500).json(
      new ErrorResponse("Failed to delete Sub Event", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

