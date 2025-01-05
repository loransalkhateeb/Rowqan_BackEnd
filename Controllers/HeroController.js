const Hero = require('../Models/HeroModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')



exports.createHero = async (req, res) => {
  try {
    const { title, description, title_btn, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const validationErrors = validateInput({ title, description, title_btn, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
    }

    const newHero = await Hero.create({
      title,
      description,
      title_btn,
      image,
      lang,
    });

    res.status(201).json(
      newHero
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create Hero', ['An error occurred while creating the hero']));
  }
};

exports.getHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const cacheKey = `hero:${id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for hero:", id, lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for hero:", id, lang);

  
    const hero = await Hero.findOne({
      where: { id, lang },
    });

    
    if (!hero) {
      return res.status(404).json(
         ErrorResponse(`Hero with id ${id} and language ${lang} not found`, [
          'No hero found with the given parameters',
        ])
      );
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(hero));

   
    return res.status(200).json(hero);
  } catch (error) {
    console.error("Error in getHeroById:", error);

    return res.status(500).json(
       ErrorResponse("Failed to fetch Hero", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};





exports.updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, title_btn, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const validationErrors = validateInput({ title, description, title_btn, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
    }

    const hero = await Hero.findByPk(id);
    if (!hero) {
      return res.status(404).json(new ErrorResponse('Hero not found', ['No hero found with the given id']));
    }

    hero.title = title || hero.title;
    hero.description = description || hero.description;
    hero.title_btn = title_btn || hero.title_btn;
    hero.lang = lang || hero.lang;
    hero.image = image || hero.image;

    await hero.save();

    res.status(200).json(
      hero
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Hero', ['An error occurred while updating the hero']));
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const [hero, _] = await Promise.all([
      Hero.findOne({ where: { id, lang } }),
      client.del(`hero:${id}:${lang}`), 
    ]);

    if (!hero) {
      return res.status(404).json(
         ErrorResponse('Hero not found', [
          'No hero found with the given id and language',
        ])
      );
    }

   
    await hero.destroy();

    return res.status(200).json({ message: 'Hero deleted successfully' });
  } catch (error) {
    console.error('Error in deleteHero:', error);

    return res.status(500).json(
       ErrorResponse('Failed to delete Hero', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};




exports.getHeroesByLang = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `heroes:lang:${lang}:page:${page}:limit:${limit}`;
    
    const cachedData = await client.get(cacheKey);
    
    if (cachedData) {
      console.log("Cache hit for heroes:", lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for heroes:", lang);

    const heroes = await Hero.findAll({
      where: { lang },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (heroes.length === 0) {
      return res.status(404).json(
        new ErrorResponse("No heroes found for this language", [
          "No heroes found with the given language",
        ])
      );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(heroes));

    res.status(200).json(
       heroes,
    );
  } catch (error) {
    console.error("Error in getHeroesByLang:", error.message);
    res.status(500).json(
      new ErrorResponse("Failed to fetch Heroes", [
        "An internal server error occurred while retrieving the heroes",
      ])
    );
  }
};

