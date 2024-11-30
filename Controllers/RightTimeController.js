const  RightTimeModel  = require('../Models/RightTimeModel');
const Chalet  = require('../Models/ChaletsModel');
const path = require('path');

exports.createRightTime = async (req, res) => {
  try {
    const { name, time, lang, chalet_id } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !time || !lang || !chalet_id) {
      return res.status(400).json({ error: 'Name, time, language, and chalet_id are required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
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
    res.status(500).json({ error: 'Failed to create RightTime' });
  }
};

exports.getAllRightTimes = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const rightTimes = await RightTimeModel.findAll({ where: { lang } });

    if (!rightTimes.length) {
      return res.status(404).json({ error: 'No RightTimes found for this language' });
    }

    res.status(200).json({ rightTimes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve RightTimes' });
  }
};

exports.updateRightTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, lang, chalet_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const rightTime = await RightTimeModel.findOne({ where: { id } });

    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
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
    res.status(500).json({ error: 'Failed to update RightTime' });
  }
};

exports.getRightTimeById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const rightTime = await RightTimeModel.findOne({ where: { id, lang } });

    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
    }

    res.status(200).json({ rightTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch RightTime' });
  }
};

exports.deleteRightTime = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const rightTime = await RightTimeModel.findOne({ where: { id, lang } });

    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
    }

    await rightTime.destroy();

    res.status(200).json({ message: 'RightTime deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete RightTime' });
  }
};
