const PropertiesLands = require("../Models/PropertiesLandsModel");
const CategoriesLandsModel = require("../Models/CategoriesLandsModel");
const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const {client} = require('../Utils/redisClient')

exports.createPropertyLand = async (req, res) => {
  try {
    const { property, lang, category_land_id } = req.body;
    const image = req.file ? req.file.filename : null;

   
    if (!property || !lang || !category_land_id) {
      return res.status(400).json(ErrorResponse("Property, language, and category_land_id are required."));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    
    const [newPropertyLand, created] = await PropertiesLands.findOrCreate({
      where: { property, lang, category_land_id },
      defaults: { property, lang, image, category_land_id }
    });


    if (!created) {
      return res.status(400).json(ErrorResponse("Property land with the same details already exists"));
    }

    
    res.status(201).json(
      newPropertyLand,
    );
  } catch (error) {
    console.error("Error creating Property Land:", error);
    res.status(500).json(ErrorResponse("Failed to create Property Land"));
  }
};


exports.getAllPropertyLands = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const {lang} = req.params
   
    if (lang && !["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

  
    const cacheKey = `propertyLands:page:${page}:limit:${limit}:lang:${lang}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {

      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }

   
    const propertyLands = await PropertiesLands.findAll({
      where: { lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],  
    });

    if (propertyLands.length === 0) {
    
      return res.status(404).json(ErrorResponse(lang === "en" ? "No property lands found" : "لا توجد أراضٍ عقارية"));
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(propertyLands));

    res.status(200).json(
      propertyLands,
    );
  } catch (error) {
    console.error("Error in getAllPropertyLands:", error.message);
    res.status(500).json(ErrorResponse("Failed to retrieve property lands", ["An internal server error occurred. Please try again later."]));
  }
};



exports.getPropertyLandByland_id = async (req, res) => {
  try {
    const { category_land_id, lang } = req.params;

    const cacheKey = `propertyLand:${category_land_id}:lang:${lang}`;
    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for property land:", category_land_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for property land:", category_land_id);

    const propertyLand = await PropertiesLands.findAll({
      where: { category_land_id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title', 'price', 'location'],
      },
    });

    if (!propertyLand || propertyLand.length === 0) {
      return res.status(404).json(
        ErrorResponse(lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة")
      );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(propertyLand));

    res.status(200).json(
      propertyLand,
    );
  } catch (error) {
    console.error("Error in getPropertyLandByland_id:", error);
    res.status(500).json(
      ErrorResponse("Failed to retrieve property land", ["An internal server error occurred. Please try again later."])
    );
  }
};



exports.getPropertyLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    const cacheKey = `propertyLand:${id}:lang:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for property land:", id);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for property land:", id);


    const propertyLand = await PropertiesLands.findOne({
      where: { id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!propertyLand) {
      return res.status(404).json(
        ErrorResponse(lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة")
      );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(propertyLand));


    res.status(200).json(
      propertyLand,
    );
  } catch (error) {
    console.error("Error in getPropertyLandById:", error);
    res.status(500).json(
      ErrorResponse("Failed to retrieve property land", ["An internal server error occurred. Please try again later."])
    );
  }
};


exports.updatePropertyLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { property, lang, category_land_id } = req.body;
    const image = req.file?.filename || null;

   
    const validationErrors = validateInput({ property, lang, category_land_id });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const propertyLand = await PropertiesLands.findByPk(id);
    if (!propertyLand) {
      return res
        .status(404)
        .json(ErrorResponse(lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة"));
    }


    const updatedFields = {};
    if (property && property !== propertyLand.property) updatedFields.property = property;
    if (lang && lang !== propertyLand.lang) updatedFields.lang = lang;
    if (category_land_id && category_land_id !== propertyLand.category_land_id) updatedFields.category_land_id = category_land_id;
    if (image) updatedFields.image = image;

  
    if (Object.keys(updatedFields).length > 0) {
      await propertyLand.update(updatedFields);
    }

    const updatedData = propertyLand.toJSON();

    return res.status(200).json(
       updatedData,
  );
  } catch (error) {
    console.error("Error in updatePropertyLand:", error);

    return res.status(500).json(
      ErrorResponse("Failed to update Property land", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};





exports.deletePropertyLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    const [propertyLand, _] = await Promise.all([
      PropertiesLands.findOne({ where: { id, lang } }),
      client.del(`propertyLand:${id}:lang:${lang}`), 
    ]);

    
    if (!propertyLand) {
      return res.status(404).json({
        error: lang === "en" ? "Property land not found" : "الأرض العقارية غير موجودة",
      });
    }


    await propertyLand.destroy();

    return res.status(200).json({
      message: lang === "en" ? "Property land deleted successfully" : "تم حذف الأرض العقارية بنجاح",
    });
  } catch (error) {
    console.error("Error in deletePropertyLand:", error);

    return res.status(500).json({
      error: lang === "en" ? "Failed to delete property land" : "فشل في حذف الأرض العقارية",
    });
  }
};


