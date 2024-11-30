const Chalet = require('../Models/ChaletsModel');
const Status = require('../Models/StatusModel');
const multer = require('../Config/Multer');
const path = require('path');
const ChaletsDetails = require('../Models/ChaletsDetails')


exports.createChalet = async (req, res) => {
  try {
    const { title, lang, status_id } = req.body;
    const image = req.file ? req.file.filename : null;


    if (!title || !lang || !status_id) {
      return res.status(400).json({
        error: 'Title, language, and status_id are required',
      });
    }


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    const status = await Status.findByPk(status_id);
    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }


    const newChalet = await Chalet.create({
      title,
      image,
      lang,
      status_id,
    });

    res.status(201).json({
      message: 'Chalet created successfully',
      chalet: newChalet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create chalet' });
  }
};

exports.getAllChalets = async (req, res) => {
  try {
    const { lang } = req.params; 


    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }


    const whereClause = lang ? { lang } : {};
    const chalets = await Chalet.findAll({
      where: whereClause,
      include: [{ model: Status, attributes: ['status'] }],
    });

    res.status(200).json({ chalets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chalets' });
  }
};

exports.getChaletById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query; 

    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Supported languages are "ar" and "en".',
        });
      }
      whereClause.lang = lang;
    }

    const chalet = await Chalet.findOne({
      where: whereClause,
      include: [{ model: Status, attributes: ['status'] }],
    });

    if (!chalet) {
      return res
        .status(404)
        .json({ error: `Chalet with id ${id} and language ${lang} not found` });
    }

    res.status(200).json({ chalet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chalet' });
  }
};


exports.getChaletByStatus = async (req, res) => {
  try {
    const { status_id, lang } = req.params; 

    if (!status_id) {
      return res.status(400).json({ error: 'status_id is required' });
    }

  
    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

 
    const whereClause = { status_id };
    if (lang) {
      whereClause.lang = lang;
    }

   
    const chalets = await Chalet.findAll({
      where: whereClause,
      include: [{ model: Status, attributes: ['status'] }], 
    });

    if (chalets.length === 0) {
      return res.status(404).json({
        error: `No chalets found with status_id ${status_id} and language ${lang || 'not provided'}.`,
      });
    }

    res.status(200).json({ chalets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chalets' });
  }
};

exports.getChaletsByDetailType = async (req, res) => {
  try {
    const { type, lang } = req.params;  

    if (!type || !lang) {
      return res.status(400).json({ error: 'Detail type and language are required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const chalets = await Chalet.findAll({
      include: {
        model: ChaletsDetails,  
        where: { 
          lang,       
          detail_type: type 
        },
        required: true, 
      },
    });

    if (chalets.length === 0) {
      return res.status(404).json({ error: 'No chalets found for the given detail type and language' });
    }

    res.status(200).json({
      message: 'Chalets retrieved successfully',
      chalets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve chalets' });
  }
};







exports.updateChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, lang, status_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const chalet = await Chalet.findByPk(id);

    if (!chalet) {
      return res.status(404).json({ error: `Chalet with id ${id} not found` });
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    if (status_id) {
      const status = await Status.findByPk(status_id);
      if (!status) {
        return res.status(404).json({ error: 'Status not found' });
      }
    }

    chalet.title = title || chalet.title;
    chalet.lang = lang || chalet.lang;
    chalet.image = image || chalet.image;
    chalet.status_id = status_id || chalet.status_id;

    await chalet.save();

    res.status(200).json({ message: 'Chalet updated successfully', chalet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update chalet' });
  }
};

exports.deleteChalet = async (req, res) => {
  try {
    const { id,lang } = req.params;

    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Supported languages are "ar" and "en".',
        });
      }
      whereClause.lang = lang;
    }

    const chalet = await Chalet.findOne({ where: whereClause });

    if (!chalet) {
      return res.status(404).json({
        error: `Chalet with id ${id} and language ${lang} not found`,
      });
    }

    await chalet.destroy();

    res.status(200).json({ message: 'Chalet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete chalet' });
  }
};