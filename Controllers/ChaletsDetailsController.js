const ChaletsDetails = require('../Models/ChaletsDetails');
const { Op } = require('sequelize');
const Chalet = require('../Models/ChaletsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const {client} = require('../Utils/redisClient')

exports.createChaletDetail = async (req, res) => {
  try {
    const { Detail_Type, lang, chalet_id } = req.body;

    
    if (!Detail_Type || !lang || !chalet_id) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Detail_Type, lang, and chalet_id are required",
        ])
      );
    }

   
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

   
    const chaletDetail = await ChaletsDetails.create({
      Detail_Type,
      lang,
      chalet_id,
    });

  
    client.del(`chalet:${chalet_id}`);

   
    client.set(`chaletdetail:${chaletDetail.id}`, JSON.stringify(chaletDetail), {
      EX: 3600, 
    });

    
    return res.status(201).json(
      chaletDetail,
    );
  } catch (error) {
    console.error("Error in createChaletDetail:", error.message);
    return res.status(500).json(
      ErrorResponse('Failed to create chalet detail', [
        'An internal server error occurred.',
      ])
    );
  }
};




exports.getAllDetails = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const {lang} = req.params
   
    if (!lang || !['ar', 'en'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Language must be either "ar" or "en"'));
    }

    
    const cacheKey = `chaletsdetails:lang:${lang}:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

   
    const details = await ChaletsDetails.findAll({
      where: { lang },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    
    if (details.length === 0) {
      return res.status(404).json(ErrorResponse('No details found for this language'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(details));

    res.status(200).json(
      details,
    );
  } catch (error) {
    console.error("Error in getAllDetails:", error.message);
    res.status(500).json(
      ErrorResponse("Failed to fetch chalet details", [
        "An internal server error occurred.",
      ])
    );
  }
};



exports.getChaletDetailsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

   
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

    
    const cacheKey = `chaletdetails:${chalet_id}:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet details:", chalet_id);
      return res.status(200).json(
        JSON.parse(cachedData),
    );
    }
    console.log("Cache miss for chalet details:", chalet_id);

    
    const chaletDetails = await ChaletsDetails.findAll({
      where: { chalet_id, lang },
    });

    
    if (chaletDetails.length === 0) {
      return res.status(404).json(ErrorResponse('No details found for this chalet with the given id'));
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletDetails));

    res.status(200).json(
      chaletDetails,
    );
  } catch (error) {
    console.error("Error in getChaletDetailsByChaletId:", error);
    res.status(500).json(ErrorResponse('Failed to fetch chalet details'));
  }
};



exports.getChaletDetailsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    const chalet = await Chalet.findByPk(id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

    
    const cacheKey = `chaletdetails:${id}:${lang}`;

  
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet details by id:", id);
      return res.status(200).json( JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalet details by id:", id);

    
    const chaletDetails = await ChaletsDetails.findAll({
      where: {
        id,
        lang,
      },
    });

    
    if (chaletDetails.length === 0) {
      return res.status(404).json(ErrorResponse('No details found for this chalet'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletDetails));

    res.status(200).json(
      chaletDetails,
  );
  } catch (error) {
    console.error("Error in getChaletDetailsById:", error);
    res.status(500).json(ErrorResponse('Failed to fetch chalet details'));
  }
};



exports.updateChaletDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { Detail_Type, lang, chalet_id } = req.body;
    const image = req.file?.filename || null;

    
    const validationErrors = validateInput({ Detail_Type, lang, chalet_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const chaletDetail = await ChaletsDetails.findByPk(id);
    if (!chaletDetail) {
      return res.status(404).json(ErrorResponse("Chalet detail not found"));
    }

   
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse("Chalet not found"));
    }

    
    const updatedFields = {};
    if (Detail_Type && Detail_Type !== chaletDetail.Detail_Type) updatedFields.Detail_Type = Detail_Type;
    if (lang && lang !== chaletDetail.lang) updatedFields.lang = lang;
    if (chalet_id && chalet_id !== chaletDetail.chalet_id) updatedFields.chalet_id = chalet_id;
    if (image) updatedFields.img = image; 

   
    if (Object.keys(updatedFields).length > 0) {
      await chaletDetail.update(updatedFields);
    }

  
    const updatedChaletDetail = chaletDetail.toJSON();

  
    const cacheKey = `chaletdetail:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedChaletDetail));

  
    return res.status(200).json(
      updatedChaletDetail,
    );
  } catch (error) {
    console.error("Error in updateChaletDetail:", error);

   
    return res.status(500).json(
      ErrorResponse("Failed to update Chalet detail", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};




exports.deleteChaletDetail = async (req, res) => {
  try {
    const { id } = req.params;


    const [chaletDetail, _] = await Promise.all([
      ChaletsDetails.findByPk(id),
      client.del(`chaletdetail:${id}`), 
    ]);

    
    if (!chaletDetail) {
      return res.status(404).json(
        ErrorResponse("Chalet detail not found", [
          "No Chalet detail found with the given ID.",
        ])
      );
    }

  
    await chaletDetail.destroy();

   
    return res.status(200).json({ message: "Chalet detail deleted successfully" });
  } catch (error) {
    console.error("Error in deleteChaletDetail:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Chalet detail", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

