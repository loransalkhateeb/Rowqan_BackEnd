const Events_Hero = require('../Models/EventsHeroModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client}  =  require('../Utils/redisClient')


exports.createEventHero = async (req, res) => {
  try {
    const { title, description, lang } = req.body;
    const image = req.file?.filename;

    
    if (!title || !description || !lang || !image) {
      return res.status(400).json(
        ErrorResponse("Title, description, language, and image are required.")
      );
    }

  
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

   
    const [newEventHero, created] = await Events_Hero.findOrCreate({
      where: { title, lang },
      defaults: { title, description, lang, image },
    });

  
    if (!created) {
      return res.status(400).json(
        ErrorResponse("Event Hero with the same title and language already exists.")
      );
    }


    res.status(201).json(
      newEventHero,
    );
  } catch (error) {
    console.error("Error creating Event Hero:", error);
    res.status(500).json(ErrorResponse("Failed to create Event Hero."));
  }
};


exports.getAllEventHeroes = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;


    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

    
    const whereClause = lang ? { lang } : {};

  
    const cacheKey = `eventHeroes:page:${page}:limit:${limit}:lang:${lang || 'all'}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    
    const eventHeroes = await Events_Hero.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    
    if (!eventHeroes.length) {
      return res.status(404).json(ErrorResponse('No events found for the given language.'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(eventHeroes));

  
    res.status(200).json(
      eventHeroes,
    );
  } catch (error) {
    console.error('Error fetching Event Heroes:', error);
    res.status(500).json(ErrorResponse('Failed to fetch Event Heroes.'));
  }
};




exports.getEventHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
      }
      whereClause.lang = lang;
    }

    const cacheKey = `eventHero:${id}:lang:${lang || 'all'}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for eventHero:", id);
      return res.status(200).json(
        JSON.parse(cachedData)
      );
    }
    console.log("Cache miss for eventHero:", id);

  
    const eventHero = await Events_Hero.findOne({ where: whereClause });

   
    if (!eventHero) {
      return res.status(404).json(ErrorResponse('Event Hero not found.'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(eventHero));


    return res.status(200).json(eventHero);
  } catch (error) {
    console.error('Error fetching Event Hero:', error);
    return res.status(500).json(ErrorResponse('Failed to fetch Event Hero.'));
  }
};


exports.updateEventHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lang } = req.body;
    const image = req.file?.filename;

    const eventHero = await Events_Hero.findByPk(id);

    if (!eventHero) {
      return res.status(404).json(ErrorResponse(`Event Hero with id ${id} not found.`));
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

    
    eventHero.title = title || eventHero.title;
    eventHero.description = description || eventHero.description;
    eventHero.lang = lang || eventHero.lang;
    eventHero.image = image || eventHero.image;

    await eventHero.save();

    res.status(200).json( eventHero );
  } catch (error) {
    console.error('Error updating Event Hero:', error);
    res.status(500).json(ErrorResponse('Failed to update Event Hero.'));
  }
};

exports.deleteEventHero = async (req, res) => {
  try {
    const { id } = req.params;

    
    const [eventHero, _] = await Promise.all([
      Events_Hero.findByPk(id),
      client.del(`eventHero:${id}`), 
    ]);

    
    if (!eventHero) {
      return res.status(404).json(
        ErrorResponse("Event Hero not found", [
          "No Event Hero found with the given ID.",
        ])
      );
    }

    
    await eventHero.destroy();

    return res.status(200).json({ message: "Event Hero deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEventHero:", error);


    return res.status(500).json(
      ErrorResponse("Failed to delete Event Hero", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

