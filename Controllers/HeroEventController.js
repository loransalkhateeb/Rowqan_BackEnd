const Events_Hero = require('../Models/EventsHeroModel');
const multer = require('../Config/Multer'); 
const path = require('path');


exports.createEventHero = async (req, res) => {
  try {
    const { title, description, lang } = req.body;
    const image = req.file ? req.file.filename : null; 

    if (!title || !lang || !description) {
      return res.status(400).json({ error: 'Title, description, and language are required' });
    }

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en"' });
    }

    const newEventHero = await Events_Hero.create({
      title,
      image,
      description,
      lang,
    });

    res.status(201).json({
      message: 'Event Hero created successfully',
      eventHero: newEventHero,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Event Hero' });
  }
};


exports.getAllEventHeroes = async (req, res) => {
  try {
    const { lang } = req.params;

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en"' });
    }

    const whereClause = lang ? { lang } : {}; 
    const eventHeroes = await Events_Hero.findAll({ where: whereClause });

    if (!eventHeroes.length) {
      return res.status(404).json({ error: 'No events found for the given language' });
    }

    res.status(200).json( eventHeroes );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event heroes' });
  }
};


exports.getEventHeroById = async (req, res) => {
  try {
    const { id,lang } = req.params;

    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en"' });
      }
      whereClause.lang = lang;
    }

    const eventHero = await Events_Hero.findOne({ where: whereClause });

    if (!eventHero) {
      return res.status(404).json({ error: 'Event Hero not found' });
    }

    res.status(200).json({ eventHero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event hero' });
  }
};


exports.updateEventHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lang } = req.body;
    const image = req.file ? req.file.filename : null; 

    const eventHero = await Events_Hero.findByPk(id);

    if (!eventHero) {
      return res.status(404).json({ error: `Event Hero with id ${id} not found` });
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en"' });
    }

    eventHero.title = title || eventHero.title;
    eventHero.description = description || eventHero.description;
    eventHero.lang = lang || eventHero.lang;
    eventHero.image = image || eventHero.image;

    await eventHero.save();

    res.status(200).json({ message: 'Event Hero updated successfully', eventHero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event hero' });
  }
};

exports.deleteEventHero = async (req, res) => {
    try {
      const { id, lang } = req.params;  
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Supported languages are "ar" and "en".'
        });
      }
  
      const eventHero = await Events_Hero.findOne({ 
        where: { id, lang } 
      });
  
      if (!eventHero) {
        return res.status(404).json({ 
          error: `Event Hero with id ${id} and language ${lang} not found` 
        });
      }
  
      await eventHero.destroy();
  
      res.status(200).json({ message: 'Event Hero deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete event hero' });
    }
  };
  