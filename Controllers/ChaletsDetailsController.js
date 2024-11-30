const  ChaletsDetails  = require('../Models/ChaletsDetails');
const { Op } = require('sequelize');
const Chalet = require('../Models/ChaletsModel')
exports.createChaletDetail = async (req, res) => {
  try {
    const { Detail_Type, lang, chalet_id } = req.body;

    if (!Detail_Type || !lang || !chalet_id) {
      return res.status(400).json({ error: 'Detail_Type, lang, and chalet_id are required' });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    const chaletDetail = await ChaletsDetails.create({
      Detail_Type,
      lang,
      chalet_id,
    });

    res.status(201).json({
      message: 'Chalet detail created successfully',
      chaletsDetail: chaletDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create chalet detail' });
  }
};






exports.getAllDetails = async (req, res) => {
    try {
      const { lang } = req.params;
  
 
      if (!lang || !['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Language must be either "ar" or "en"' });
      }
  
     
      const details = await ChaletsDetails.findAll({
        where: { lang },  
      });
  
      if (details.length === 0) {
        return res.status(404).json({ error: 'No details found for this language' });
      }
  
      res.status(200).json({ details });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch chalet details' });
    }
  };

  exports.getChaletDetailsByChaletId = async (req, res) => {
    try {
      const { chalet_id, lang, id } = req.params; 
  
      const chalet = await Chalet.findByPk(chalet_id);
      if (!chalet) {
        return res.status(404).json({ error: 'Chalet not found' });
      }
  
      const chaletDetails = await ChaletsDetails.findAll({
        where: {
          chalet_id,
          lang,
          id, 
        },
      });
  
      if (chaletDetails.length === 0) {
        return res.status(404).json({ error: 'No details found for this chalet with the given id' });
      }
  
      res.status(200).json({ chaletDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch chalet details' });
    }
  };
  


exports.getChaletDetailsById = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      const chalet = await Chalet.findByPk(id);
      if (!chalet) {
        return res.status(404).json({ error: 'Chalet not found' });
      }
  
      const chaletDetails = await ChaletsDetails.findAll({
        where: {
          id,
          lang,
        },
      });
  
      if (chaletDetails.length === 0) {
        return res.status(404).json({ error: 'No details found for this chalet' });
      }
  
      res.status(200).json({ chaletDetails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch chalet details' });
    }
  };

exports.updateChaletDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { Detail_Type, lang, chalet_id } = req.body;

    const chaletDetail = await ChaletsDetails.findByPk(id);
    if (!chaletDetail) {
      return res.status(404).json({ error: 'Chalet detail not found' });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    chaletDetail.Detail_Type = Detail_Type || chaletDetail.Detail_Type;
    chaletDetail.lang = lang || chaletDetail.lang;
    chaletDetail.chalet_id = chalet_id || chaletDetail.chalet_id;

    await chaletDetail.save();

    res.status(200).json({
      message: 'Chalet detail updated successfully',
      chaletDetail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update chalet detail' });
  }
};

exports.deleteChaletDetail = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      const chaletDetail = await ChaletsDetails.findOne({
        where: {
          id,
          lang,
        },
      });
  
      if (!chaletDetail) {
        return res.status(404).json({ error: 'Chalet detail not found' });
      }
  
      await chaletDetail.destroy();
  
      res.status(200).json({ message: 'Chalet detail deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete chalet detail' });
    }
  };
  
