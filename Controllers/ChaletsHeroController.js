const ChaletsHero = require('../Models/ChaletsHero');
const { validateInput, ErrorResponse } = require('../Utils/validateInput'); 


exports.createChaletsHero = async (req, res) => {
  try {
    const { category, lang } = req.body;

 
    const validationErrors = validateInput(req.body, ['category', 'lang']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!req.file) {
      return res.status(400).json(ErrorResponse('Image is required'));
    }

    const image = req.file.filename;

    const newChaletsHero = await ChaletsHero.create({
      image,
      category,
      lang,
    });

    res.status(201).json({
      message: 'Chalets Hero created successfully',
      chaletHero: newChaletsHero,
    });
  } catch (error) {
    console.error('Error creating Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to create Chalets Hero'));
  }
};


exports.updateChaletsHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, lang } = req.body;

    
    const validationErrors = validateInput(req.body, ['category', 'lang']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const chaletHero = await ChaletsHero.findOne({ where: { id } });

    if (!chaletHero) {
      return res.status(404).json(ErrorResponse('Chalets Hero not found'));
    }

    chaletHero.category = category || chaletHero.category;
    chaletHero.lang = lang || chaletHero.lang;

    if (req.file) {
      chaletHero.image = req.file.filename;
    }

    await chaletHero.save();

    res.status(200).json({
      message: 'Chalets Hero updated successfully',
      chaletHero,
    });
  } catch (error) {
    console.error('Error updating Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to update Chalets Hero'));
  }
};


exports.getChaletsHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const chaletHero = await ChaletsHero.findOne({ where: { id, lang } });

    if (!chaletHero) {
      return res.status(404).json(ErrorResponse('Chalets Hero not found'));
    }

    res.status(200).json({ chaletHero });
  } catch (error) {
    console.error('Error fetching Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to fetch Chalets Hero'));
  }
};


exports.getAllChaletsHero = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!lang) {
      return res.status(400).json(ErrorResponse('Language parameter is required'));
    }

    const chaletsHeroes = await ChaletsHero.findAll({ where: { lang } });

    if (chaletsHeroes.length === 0) {
      return res.status(404).json(ErrorResponse('No Chalets Heroes found for the given language'));
    }

    res.status(200).json({ chaletsHeroes });
  } catch (error) {
    console.error('Error fetching Chalets Heroes by language:', error);
    res.status(500).json(ErrorResponse('Failed to fetch Chalets Heroes'));
  }
};


exports.deleteChaletsHero = async (req, res) => {
  try {
    const { id } = req.params;

    const chaletHero = await ChaletsHero.findByPk(id);

    if (!chaletHero) {
      return res.status(404).json(ErrorResponse('Chalets Hero not found'));
    }

    await chaletHero.destroy();

    res.status(200).json({ message: 'Chalets Hero deleted successfully' });
  } catch (error) {
    console.error('Error deleting Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to delete Chalets Hero'));
  }
};
