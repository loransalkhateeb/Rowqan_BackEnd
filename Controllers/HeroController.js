const Hero = require('../Models/HeroModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

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

    res.status(201).json({
      message: 'Hero created successfully',
      hero: newHero
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create Hero', ['An error occurred while creating the hero']));
  }
};

exports.getHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const hero = await Hero.findOne({ where: { id, lang } });

    if (!hero) {
      return res.status(404).json(new ErrorResponse(`Hero with id ${id} and language ${lang} not found`, ['No hero found with the given parameters']));
    }

    res.status(200).json([hero]);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch hero', ['An error occurred while fetching the hero']));
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

    res.status(200).json({
      message: 'Hero updated successfully',
      hero
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Hero', ['An error occurred while updating the hero']));
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const hero = await Hero.findOne({ where: { id, lang } });
    if (!hero) {
      return res.status(404).json(new ErrorResponse('Hero not found', ['No hero found with the given id and language']));
    }

    await hero.destroy();
    res.status(200).json({ message: 'Hero deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete Hero', ['An error occurred while deleting the hero']));
  }
};

exports.getHeroesByLang = async (req, res) => {
  try {
    const { lang } = req.params;

    const heroes = await Hero.findAll({ where: { lang } });

    if (heroes.length === 0) {
      return res.status(404).json(new ErrorResponse('No heroes found for this language', ['No heroes found with the given language']));
    }

    res.status(200).json(heroes);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Heroes', ['An error occurred while retrieving the heroes']));
  }
};
