const HeroLandsModel = require("../Models/HeroLandsModel");
const { validateInput, ErrorResponse } = require("../Utils/validateInput");

exports.createHeroLand = async (req, res) => {
  try {
    const { title, description, title_btn, lang } = req.body;
    const image = req.file?.filename;


    const validationErrors = validateInput(
      { title, description, title_btn, lang },
      ["title", "description", "title_btn", "lang"]
    );
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const newHeroLand = await HeroLandsModel.create({
      title,
      description,
      title_btn,
      lang,
      image,
    });

    res.status(201).json({
      message: lang === "en" ? "HeroLand created successfully" : "تم إنشاء الهيرو بنجاح",
      heroLand: newHeroLand,
    });
  } catch (error) {
    console.error("Error creating HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to create HeroLand."));
  }
};

exports.getAllHeroLands = async (req, res) => {
  try {
    const { lang } = req.params;

    if (lang && !["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const whereClause = lang ? { lang } : {};
    const heroLands = await HeroLandsModel.findAll({ where: whereClause });

    if (!heroLands.length) {
      return res
        .status(404)
        .json(ErrorResponse(lang === "en" ? "No HeroLands found" : "لم يتم العثور على هيرو"));
    }

    res.status(200).json({
      message: lang === "en" ? "HeroLands retrieved successfully" : "تم استرجاع الهيرو بنجاح",
      heroLands,
    });
  } catch (error) {
    console.error("Error fetching HeroLands:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve HeroLands."));
  }
};

exports.getHeroLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const validationErrors = validateInput({ id, lang }, ["id"]);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const whereClause = { id };
    if (lang) {
      if (!["ar", "en"].includes(lang)) {
        return res
          .status(400)
          .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
      }
      whereClause.lang = lang;
    }

    const heroLand = await HeroLandsModel.findOne({ where: whereClause });

    if (!heroLand) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "HeroLand not found" : "الهيرو غير موجود"));
    }

    res.status(200).json({
      message: lang === "en" ? "HeroLand retrieved successfully" : "تم استرجاع الهيرو بنجاح",
      heroLand,
    });
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

    res.status(200).json({
      message: lang === "en" ? "HeroLand updated successfully" : "تم تحديث الهيرو بنجاح",
      heroLand,
    });
  } catch (error) {
    console.error("Error updating HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to update HeroLand."));
  }
};

exports.deleteHeroLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const validationErrors = validateInput({ id, lang }, ["id", "lang"]);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!["ar", "en"].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const heroLand = await HeroLandsModel.findOne({ where: { id, lang } });

    if (!heroLand) {
      return res
        .status(404)
        .json(ErrorResponse(lang === "en" ? "HeroLand not found" : "الهيرو غير موجود"));
    }

    await heroLand.destroy();

    res.status(200).json({
      message: lang === "en" ? "HeroLand deleted successfully" : "تم حذف الهيرو بنجاح",
    });
  } catch (error) {
    console.error("Error deleting HeroLand:", error);
    res.status(500).json(ErrorResponse("Failed to delete HeroLand."));
  }
};
