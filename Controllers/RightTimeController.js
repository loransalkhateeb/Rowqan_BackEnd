const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const RightTimeModel = require('../Models/RightTimeModel');
const Chalet = require('../Models/ChaletsModel');
const path = require('path');

exports.createRightTime = async (req, res) => {
  try {
    const { name, time, lang, chalet_id } = req.body;
    const image = req.file ? req.file.filename : null;

  
    const validationErrors = validateInput({ name, time, lang, chalet_id });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(new ErrorResponse('Chalet not found'));
    }

    const newRightTime = await RightTimeModel.create({
      image,
      name,
      time,
      lang,
      chalet_id,
    });

    res.status(201).json({
      message: 'RightTime created successfully',
      rightTime: newRightTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create RightTime'));
  }
};

exports.getAllRightTimes = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const rightTimes = await RightTimeModel.findAll({ where: { lang } });

    if (!rightTimes.length) {
      return res.status(404).json(new ErrorResponse('No RightTimes found for this language'));
    }

    res.status(200).json({ rightTimes });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve RightTimes'));
  }
};

exports.getAllRightTimesByChaletId = async (req, res) => {
  try {
    const { lang, chalet_id } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    if (!chalet_id) {
      return res.status(400).json(new ErrorResponse('Chalet_id is required'));
    }

    const rightTimes = await RightTimeModel.findAll({
      where: {
        lang,
        chalet_id,
      },
    });

    if (!rightTimes.length) {
      return res.status(404).json(new ErrorResponse('No RightTimes found for this language and Chalet_id'));
    }

    res.status(200).json({ rightTimes });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve RightTimes'));
  }
};

exports.updateRightTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, lang, chalet_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const rightTime = await RightTimeModel.findOne({ where: { id } });

    if (!rightTime) {
      return res.status(404).json(new ErrorResponse('RightTime not found'));
    }


    const validationErrors = validateInput({ name, time, lang, chalet_id });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    rightTime.name = name || rightTime.name;
    rightTime.time = time || rightTime.time;
    rightTime.lang = lang || rightTime.lang;
    rightTime.chalet_id = chalet_id || rightTime.chalet_id;
    rightTime.image = image || rightTime.image;

    await rightTime.save();

    res.status(200).json({ message: 'RightTime updated successfully', rightTime });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update RightTime'));
  }
};

exports.getRightTimeById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const rightTime = await RightTimeModel.findOne({ where: { id, lang } });

    if (!rightTime) {
      return res.status(404).json(new ErrorResponse('RightTime not found'));
    }

    res.status(200).json({ rightTime });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch RightTime'));
  }
};

exports.deleteRightTime = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const rightTime = await RightTimeModel.findOne({ where: { id, lang } });

    if (!rightTime) {
      return res.status(404).json(new ErrorResponse('RightTime not found'));
    }

    await rightTime.destroy();

    res.status(200).json({ message: 'RightTime deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete RightTime'));
  }
};
