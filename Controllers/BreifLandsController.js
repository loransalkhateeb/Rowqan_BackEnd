const BreifLandsModel = require('../Models/BriefLandsModel');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');


exports.createBreifLand = async (req, res) => {
  try {
    const { type, value, lang, category_id } = req.body;

    const newBreifLand = await BreifLandsModel.create({
      type,
      value,
      lang,
      category_id,
    });

    res.status(201).json({
      message: "Breif Land created successfully",
      breifLand: newBreifLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Breif Land" });
  }
};


exports.getAllBreifLandsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const breifLands = await BreifLandsModel.findAll({
      where: { category_id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (breifLands.length === 0) {
      return res.status(404).json({ error: "No Breif Lands found for this category" });
    }

    res.status(200).json({
      message: "Breif Lands retrieved successfully",
      breifLands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve Breif Lands" });
  }
};


exports.getBreifLandById = async (req, res) => {
  try {
    const { id } = req.params;

    const breifLand = await BreifLandsModel.findOne({
      where: { id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!breifLand) {
      return res.status(404).json({ error: "Breif Land not found" });
    }

    res.status(200).json({
      message: "Breif Land retrieved successfully",
      breifLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve Breif Land" });
  }
};


exports.updateBreifLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, lang, category_id } = req.body;

    const breifLand = await BreifLandsModel.findByPk(id);

    if (!breifLand) {
      return res.status(404).json({ error: "Breif Land not found" });
    }

    breifLand.type = type || breifLand.type;
    breifLand.value = value || breifLand.value;
    breifLand.lang = lang || breifLand.lang;
    breifLand.category_id = category_id || breifLand.category_id;

    await breifLand.save();

    res.status(200).json({
      message: "Breif Land updated successfully",
      breifLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Breif Land" });
  }
};


exports.deleteBreifLand = async (req, res) => {
    try {
      const { id, lang } = req.params; 
      const breifLand = await BreifLandsModel.findOne({ 
        where: { id, lang } 
      });
  
      if (!breifLand) {
        return res.status(404).json({ 
          error: lang === "en" 
            ? "Breif Land not found" 
            : "البيانات الموجزة غير موجودة" 
        });
      }
  
      await breifLand.destroy();
  
      res.status(200).json({
        message: lang === "en" 
          ? "Breif Land deleted successfully" 
          : "تم حذف البيانات الموجزة بنجاح",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        error: lang === "en" 
          ? "Failed to delete Breif Land" 
          : "فشل في حذف البيانات الموجزة" 
      });
    }
  };
  