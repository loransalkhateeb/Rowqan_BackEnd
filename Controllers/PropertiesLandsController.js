const PropertiesLands = require("../Models/PropertiesLandsModel");
const CategoriesLandsModel = require("../Models/CategoriesLandsModel");

exports.createPropertyLand = async (req, res) => {
  try {
    const { property, lang, category_land_id } = req.body;
    const image = req.file ? req.file.filename : null; 

    const newPropertyLand = await PropertiesLands.create({
      property,
      lang,
      image,
      category_land_id,  
    });

    res.status(201).json({
      message: lang === "en" ? "Property Land created successfully" : "تم إنشاء العقار بنجاح",
      propertyLand: newPropertyLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Property Land" });
  }
};

exports.getAllPropertyLands = async (req, res) => {
  try {
    const { lang } = req.params;
    const propertyLands = await PropertiesLands.findAll({
      where: { lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      }
    });

    if (propertyLands.length === 0) {
      return res.status(404).json({ error: lang === "en" ? "No property lands found" : "لا توجد أراضٍ عقارية" });
    }

    res.status(200).json(
      propertyLands,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve property lands" });
  }
};
exports.getPropertyLandByland_id = async (req, res) => {
  try {
    const { category_land_id , lang } = req.params;

    const propertyLand = await PropertiesLands.findAll({
      where: { category_land_id , lang }
    });

    if (!propertyLand) {
      return res.status(404).json({ error: lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة" });
    }

    res.status(200).json(
      propertyLand,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve property land" });
  }
};
exports.getPropertyLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const propertyLand = await PropertiesLands.findOne({
      where: { id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'], 
      }
    });

    if (!propertyLand) {
      return res.status(404).json({ error: lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة" });
    }

    res.status(200).json({
      message: lang === "en" ? "Property land retrieved successfully" : "تم استرجاع الأرض العقارية بنجاح",
      propertyLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve property land" });
  }
};

exports.updatePropertyLand = async (req, res) => {
  try {
    const { id,  } = req.params;
    const { property, lang,category_land_id } = req.body;
    const image = req.file ? req.file.filename : null;


    const propertyLand = await PropertiesLands.findByPk(id);
    if (!propertyLand) {
      return res.status(404).json({ error: lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة" });
    }

    propertyLand.property = property || propertyLand.property;
    propertyLand.image = image || propertyLand.image;
    propertyLand.lang = lang || propertyLand.lang;
    propertyLand.category_land_id = category_land_id || propertyLand.category_land_id;  

    await propertyLand.save();

    res.status(200).json({
      message: lang === "en" ? "Property land updated successfully" : "تم تحديث الأرض العقارية بنجاح",
      propertyLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update property land" });
  }
};

exports.deletePropertyLand = async (req, res) => {
  try {
    const { id, lang } = req.params;


    const propertyLand = await PropertiesLands.findOne({ where: { id, lang } });

    if (!propertyLand) {
      return res.status(404).json({
        error: lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة",
      });
    }


    await propertyLand.destroy();

    res.status(200).json({
      message: lang === "en" ? "Property land deleted successfully" : "تم حذف الأرض العقارية بنجاح",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: lang === "en" ? "Failed to delete property land" : "فشل في حذف الأرض العقارية",
    });
  }
};
