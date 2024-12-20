const BreifDetailsChalets = require('../Models/BreifDetailsChalets');
const Chalet = require('../Models/ChaletsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createBreifDetailsChalet = async (req, res) => {
  try {
    const { type, value, lang, chalet_id } = req.body;

    const validationErrors = validateInput({ type, value, lang, chalet_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(new ErrorResponse('Chalet not found'));
    }

    const existingBreifDetailsChalet = await BreifDetailsChalets.findOne({ where: { chalet_id, lang, type } });
    if (existingBreifDetailsChalet) {
      return res.status(400).json(new ErrorResponse('BreifDetailsChalet with the same type, lang, and chalet_id already exists'));
    }

    const newBreifDetailsChalet = await BreifDetailsChalets.create({
      type,
      value,
      lang,
      chalet_id,
    });

    res.status(201).json({
      message: 'BreifDetailsChalet created successfully',
      breifDetailsChalet: newBreifDetailsChalet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create BreifDetailsChalet'));
  }
};

exports.getBreifDetailsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const chalet = await Chalet.findOne({
      where: { id: chalet_id },
      include: {
        model: BreifDetailsChalets,
        where: { lang },
        required: false,
      },
    });

    if (!chalet) {
      return res.status(404).json(new ErrorResponse('Chalet not found'));
    }

    res.status(200).json({
      message: 'BreifDetailsChalets retrieved successfully',
      breifDetails: chalet.BreifDetailsChalets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve BreifDetailsChalets'));
  }
};

exports.getBreifDetailsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const breifDetailsChalet = await BreifDetailsChalets.findOne({
      where: { id, lang },
    });

    if (!breifDetailsChalet) {
      return res.status(404).json(new ErrorResponse('BreifDetailsChalet not found'));
    }

    res.status(200).json({
      message: 'BreifDetailsChalet retrieved successfully',
      breifDetailsChalet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve BreifDetailsChalet'));
  }
};

exports.updateBreifDetailsChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, lang, chalet_id } = req.body;

    const validationErrors = validateInput({ type, value, lang, chalet_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const breifDetailsChalet = await BreifDetailsChalets.findByPk(id);
    if (!breifDetailsChalet) {
      return res.status(404).json(new ErrorResponse('BreifDetailsChalet not found'));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(new ErrorResponse('Chalet not found'));
    }

    breifDetailsChalet.type = type || breifDetailsChalet.type;
    breifDetailsChalet.value = value || breifDetailsChalet.value;
    breifDetailsChalet.lang = lang || breifDetailsChalet.lang;
    breifDetailsChalet.chalet_id = chalet_id || breifDetailsChalet.chalet_id;

    await breifDetailsChalet.save();

    res.status(200).json({
      message: 'BreifDetailsChalet updated successfully',
      breifDetailsChalet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update BreifDetailsChalet'));
  }
};

exports.deleteBreifDetailsChalet = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const breifDetailsChalet = await BreifDetailsChalets.findOne({
      where: { id, lang },
    });

    if (!breifDetailsChalet) {
      return res.status(404).json(new ErrorResponse('BreifDetailsChalet not found'));
    }

    await breifDetailsChalet.destroy();

    res.status(200).json({
      message: 'BreifDetailsChalet deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete BreifDetailsChalet'));
  }
};
