const HeroLandsModel = require("../Models/HeroLandsModel");
const multer = require("multer");

exports.createHeroLand = async (req, res) => {
  try {
    const { title, description, title_btn, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const newHeroLand = await HeroLandsModel.create({
      title,
      description,
      title_btn,
      lang,
      image,
    });

    res.status(201).json({
      message:
        lang === "en"
          ? "HeroLand created successfully"
          : "تم إنشاء الهيرو بنجاح",
      heroLand: newHeroLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create HeroLand" });
  }
};

exports.getAllHeroLands = async (req, res) => {
  try {
    const { lang } = req.params;
    const heroLands = await HeroLandsModel.findAll({ where: { lang } });

    if (heroLands.length === 0) {
      return res.status(404).json({ error: "No HeroLands found" });
    }

    res.status(200).json({
      message: "HeroLands retrieved successfully",
      heroLands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve HeroLands" });
  }
};

exports.getHeroLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;
    const heroLand = await HeroLandsModel.findOne({ where: { id, lang } });

    if (!heroLand) {
      return res.status(404).json({ error: "HeroLand not found" });
    }

    res.status(200).json({
      message: "HeroLand retrieved successfully",
      heroLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve HeroLand" });
  }
};

exports.updateHeroLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, title_btn, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const heroLand = await HeroLandsModel.findByPk(id);
    if (!heroLand) {
      return res.status(404).json({ error: "HeroLand not found" });
    }

    heroLand.title = title || heroLand.title;
    heroLand.description = description || heroLand.description;
    heroLand.title_btn = title_btn || heroLand.title_btn;
    heroLand.lang = lang || heroLand.lang;
    heroLand.image = image || heroLand.image;

    await heroLand.save();

    res.status(200).json({
      message:
        lang === "en"
          ? "HeroLand updated successfully"
          : "تم تحديث الهيرو بنجاح",
      heroLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update HeroLand" });
  }
};

exports.deleteHeroLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const heroLand = await HeroLandsModel.findOne({ where: { id, lang } });

    if (!heroLand) {
      return res
        .status(404)
        .json({
          error: lang === "en" ? "HeroLand not found" : "البطل الأرض غير موجود",
        });
    }
    await heroLand.destroy();

    res.status(200).json({
      message:
        lang === "en"
          ? "HeroLand deleted successfully"
          : "تم حذف البطل الأرض بنجاح",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error:
          lang === "en"
            ? "Failed to delete HeroLand"
            : "فشل في حذف البطل الأرض",
      });
  }
};
