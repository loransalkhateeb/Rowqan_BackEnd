const HeroLandsModel = require("../Models/HeroLandsModel");
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');

const {client} = require('../Utils/redisClient')


exports.createHeroLand = async (req, res) => {
  try {
    const { title, description, title_btn, lang } = req.body;
    const image = req.file?.filename;

    if (!title || !description || !title_btn || !lang) {
      return res.status(400).json(ErrorResponse("Title, description, title_btn, and language are required."));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

   
    const [newHeroLand, created] = await HeroLandsModel.findOrCreate({
      where: { title, lang },
      defaults: { title, description, title_btn, lang, image }
    });

    if (!created) {
      return res.status(400).json(ErrorResponse("HeroLand with the same title and language already exists"));
    }

    res.status(201).json(
    newHeroLand,
    );
  } catch (error) {
    console.error("Error creating HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to create HeroLand."));
  }
};




exports.getAllHeroLands = async (req, res) => {
  try {
    const { page = 1, limit = 20, lang } = req.query;
    const offset = (page - 1) * limit;


    if (lang && !["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

   
    const cacheKey = `heroLands:page:${page}:limit:${limit}:lang:${lang || 'all'}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

   
    const whereClause = lang ? { lang } : {};

   
    const heroLands = await HeroLandsModel.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    if (!heroLands.length) {
      return res.status(404).json(
        ErrorResponse(lang === "en" ? "No HeroLands found" : "لم يتم العثور على هيرو")
      );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(heroLands));


    res.status(200).json(
      heroLands,
  );
  } catch (error) {
    console.error("Error fetching HeroLands:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve HeroLands."));
  }
};



exports.getHeroLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (lang && !["ar", "en"].includes(lang)) {
      return res.status(400).json(
        ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'.")
      );
    }

    const cacheKey = `heroLand:${id}:lang:${lang || 'all'}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for heroLand:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for heroLand:", id);

    const whereClause = { id };
    if (lang) {
      whereClause.lang = lang;
    }

    const heroLand = await HeroLandsModel.findOne({ where: whereClause });

    if (!heroLand) {
      return res.status(404).json(
        ErrorResponse(lang === "en" ? "HeroLand not found" : "الهيرو غير موجود")
      );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(heroLand));

    res.status(200).json(
      heroLand,
    );
  } catch (error) {
    console.error("Error fetching HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve HeroLand."));
  }
};



exports.updateHeroLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, title_btn, lang } = req.body;
    const image = req.file?.filename;

    const heroLand = await HeroLandsModel.findByPk(id);

    if (!heroLand) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "HeroLand not found" : "الهيرو غير موجود"));
    }

    if (lang && !["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }


    heroLand.title = title || heroLand.title;
    heroLand.description = description || heroLand.description;
    heroLand.title_btn = title_btn || heroLand.title_btn;
    heroLand.lang = lang || heroLand.lang;
    heroLand.image = image || heroLand.image;

    await heroLand.save();

    res.status(200).json(
      heroLand,
    );
  } catch (error) {
    console.error("Error updating HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to update HeroLand."));
  }
};

exports.deleteHeroLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    if (lang && !["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

   
    const [heroLand, _] = await Promise.all([
      HeroLandsModel.findOne({ where: { id, lang } }), 
      client.del(`heroLand:${id}`),
    ]);


    if (!heroLand) {
      return res.status(404).json(
        ErrorResponse(
          lang === "en"
            ? "HeroLand not found"
            : "الهيرو غير موجود"
        )
      );
    }

  
    await heroLand.destroy();

   
    return res.status(200).json({
      message: lang === "en" ? "HeroLand deleted successfully" : "تم حذف الهيرو بنجاح",
    });
  } catch (error) {
    console.error("Error in deleteHeroLand:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete HeroLand", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

