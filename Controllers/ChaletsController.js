const Chalet = require('../Models/ChaletsModel');
const Status = require('../Models/StatusModel');
const multer = require('../Config/Multer');
const path = require('path');
const ChaletsDetails = require('../Models/ChaletsDetails');
const chaletsImages = require('../Models/ChaletsImagesModel');
const BreifDetailsChalets = require('../Models/BreifDetailsChalets');
const RightTimeModel = require('../Models/RightTimeModel');
const ReservationDate = require('../Models/ReservationDatesModel');
const ReservationsModel = require('../Models/ReservationsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const {client} = require('../Utils/redisClient')
const Chalet_props = require('../Models/ChaletsProps')

exports.createChalet = async (req, res) => {
  try {
    const { title, lang, status_id, reserve_price } = req.body || {};

    if (!title || !lang || !status_id || !reserve_price) {
      return res
        .status(400)
        .json(
          ErrorResponse("Validation failed", [
            "Title, language, status_id, and reserve_price are required",
          ])
        );
    }

    const validationErrors = validateInput({ title, lang, status_id, reserve_price });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

    
    if (!['ar', 'en'].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

    
    const status = await Status.findByPk(status_id);
    if (!status) {
      return res.status(404).json(ErrorResponse('Status not found'));
    }

    const img = req.file?.filename || null;

    
    const newChaletPromise = Chalet.create({
      title,
      image: img,
      lang,
      status_id,
      reserve_price,
    });

   
    const cacheDeletePromises = [client.del(`chalet:page:1:limit:20`)];

    const [newChalet] = await Promise.all([
      newChaletPromise,
      ...cacheDeletePromises,
    ]);

    
    await client.set(`chalet:${newChalet.id}`, JSON.stringify(newChalet), {
      EX: 3600, 
    });

    
    res.status(201).json(
    newChalet,
    );
  } catch (error) {
    console.error("Error in createChalet:", error);

    res
      .status(500)
      .json(ErrorResponse("Failed to create Chalet", [
        "An internal server error occurred.",
      ]));
  }
};



exports.getAllChalets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { lang } = req.params;

   
    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    const cacheKey = `chalets:page:${page}:limit:${limit}:lang:${lang || 'all'}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }

   
    const whereClause = lang ? { lang } : {};

   
    const chalets = await Chalet.findAll({
      where: whereClause,
      include: [
        { model: Status, attributes: ['status'] },
        { model: chaletsImages, attributes: ['image'] },
        { model: RightTimeModel, attributes: ['time'] },
        { model: ChaletsDetails, attributes: ['detail_type'] },
        { model: ReservationsModel, attributes: ['id'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']],
    });

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalets));

    res.status(200).json(
     chalets,
    );
  } catch (error) {
    console.error("Error in getAllChalets:", error.message);
    res.status(500).json({
      error: 'Failed to fetch chalets',
    });
  }
};




exports.getAllChaletsByProps = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { lang } = req.params;

    client.del(`chaletProps:page:${page}:limit:${limit}:lang:${lang || 'allChaletProps'}`);

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    const cacheKey = `chaletProps:page:${page}:limit:${limit}:lang:${lang || 'allChaletProps'}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }

   
    const whereClause = lang ? { lang } : {};

    const chalets = await Chalet.findAll({
      where: whereClause,
      include: [
        { model: Chalet_props, attributes: ['title','image'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']],
    });

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalets));

    res.status(200).json(
     chalets,
    );
  } catch (error) {
    console.error("Error in get All Chalets Bt Props:", error.message);
    res.status(500).json({
      error: 'Failed to fetch chalets',
    });
  }
};







exports.getChaletById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    const cacheKey = `chalet:${id}:lang:${lang || 'all'}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalet:", id);

   
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
      include: [
        { model: Status, attributes: ['status'] },
        { model: chaletsImages, attributes: ['image'] },
        { model: BreifDetailsChalets, attributes: ['type'] },
        { model: RightTimeModel, attributes: ['time'] },
        { model: ChaletsDetails, attributes: ['detail_type'] },
        { model: ReservationsModel, attributes: ['Chalet_id'] }
      ],
    });

    if (!chalet) {
      return res.status(404).json({
        error: `Chalet with id ${id} and language ${lang} not found`,
      });
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalet));

    res.status(200).json({ chalet });
  } catch (error) {
    console.error("Error in getChaletById:", error);
    res.status(500).json({ error: 'Failed to fetch chalet' });
  }
};


exports.updateChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, lang, status_id, reserve_price } = req.body;
    const image = req.file ? req.file.filename : null;

   
    const validationErrors = validateInput({ title, lang, status_id, reserve_price });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const chalet = await Chalet.findByPk(id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse(`Chalet with id ${id} not found`));
    }

    
    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language. Supported languages are "ar" and "en".'));
    }

   
    if (status_id) {
      const status = await Status.findByPk(status_id);
      if (!status) {
        return res.status(404).json(ErrorResponse('Status not found'));
      }
    }

   
    const updatedFields = {};
    if (title && title !== chalet.title) updatedFields.title = title;
    if (lang && lang !== chalet.lang) updatedFields.lang = lang;
    if (status_id && status_id !== chalet.status_id) updatedFields.status_id = status_id;
    if (reserve_price && reserve_price !== chalet.reserve_price) updatedFields.reserve_price = reserve_price;
    if (image && image !== chalet.image) updatedFields.image = image;

   
    if (Object.keys(updatedFields).length > 0) {
      await chalet.update(updatedFields);
    }

 
    const updatedData = chalet.toJSON();
    const cacheKey = `chalet:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

   
    return res.status(200).json(
      updatedData,
  );
  } catch (error) {
    console.error("Error in updateChalet:", error);
    return res.status(500).json(ErrorResponse("Failed to update chalet"));
  }
};




exports.deleteChalet = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    
    const chalet = await Chalet.findByPk(id);
    if (!chalet) {
      return res.status(404).json(
        ErrorResponse("Chalet not found", [
          "No Chalet found with the given ID.",
        ])
      );
    }

   
    if (lang && chalet.lang !== lang) {
      return res.status(400).json({
        error: `Chalet not found for the given language: ${lang}`,
      });
    }

    
    await chalet.destroy();

    
    await client.del(`chalet:${id}`);

   
    return res.status(200).json({ message: "Chalet deleted successfully" });
  } catch (error) {
    console.error("Error in deleteChalet:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Chalet", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};





exports.getChaletByStatus = async (req, res) => {
  try {
    const { status_id, lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!status_id) {
      return res.status(400).json({ error: 'status_id is required' });
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    const cacheKey = `chalets:status:${status_id}:lang:${lang || 'not_provided'}:page:${page}:limit:${limit}`;
  
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for status_id: ${status_id}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

   
    const whereClause = { status_id };
    if (lang) {
      whereClause.lang = lang;
    }

   
    const chalets = await Chalet.findAll({
      where: whereClause,
      attributes: ["id", "title", "image", "reserve_price", "lang", "status_id"],
      include: [
        { model: Status, attributes: ["status"] },
        { model: Chalet_props, attributes: ["id", "title", "image"] },
      ],
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (chalets.length === 0) {
      return res.status(404).json({
        error: `No chalets found with status_id ${status_id} and language ${lang || 'not provided'}.`,
      });
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalets));

   
    return res.status(200).json(chalets);
  } catch (error) {
    console.error("Error in getChaletByStatus:", error.message);
    return res.status(500).json({ error: 'Failed to fetch chalets' });
  }
};









exports.getChaletsByDetailType = async (req, res) => {
  try {
    const { type, lang } = req.params;
    const { page = 1, limit = 20 } = req.query; 
    const offset = (page - 1) * limit; 

    if (!type || !lang) {
      return res.status(400).json({ error: 'Detail type and language are required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const cacheKey = `chalets:detailType:${type}:lang:${lang}:page:${page}:limit:${limit}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalets with detail type:", type);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalets with detail type:", type);

   
    const chalets = await Chalet.findAll({
      include: {
        model: ChaletsDetails,
        where: {
          lang,
          detail_type: type,
        },
        required: true,
      },
      order: [["id", "DESC"]],  
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (chalets.length === 0) {
      return res.status(404).json({ error: 'No chalets found for the given detail type and language' });
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalets));

  
    res.status(200).json(
      chalets
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve chalets by detail type' });
  }
};



exports.createCategoryLand = async (req, res) => {
  try {
    const { title, price, location, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const newCategoryLand = await CategoriesLandsModel.create({
      title,
      price,
      location,
      lang,
      image,
    });

    res.status(201).json(
      newCategoryLand,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Category Land" });
  }
};

exports.getAllChaletsFront = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;  
    const offset = (page - 1) * limit;  

    if (!lang) {
      return res.status(400).json({ error: 'Language is required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const cacheKey = `chalets:lang:${lang}:page:${page}:limit:${limit}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalets");
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalets");

   
    const chalets = await Chalet.findAll({
      where: { lang },
      include: [
        {
          model: Status,
          as: "Status",
          attributes: ["status"],  
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],  
    });

    if (chalets.length === 0) {
      return res.status(404).json({
        error: lang === 'en' ? 'No Chalets found' : 'لا توجد شاليهات',
      });
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chalets));

   
    res.status(200).json(
      chalets,
    );
  } catch (error) {
    console.error("Error in getAllChaletsFront:", error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to retrieve chalets' : 'فشل في استرجاع الشاليهات',
    });
  }
};
