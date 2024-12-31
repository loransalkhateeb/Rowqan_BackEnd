const CategoriesLandsModel = require("../Models/CategoriesLandsModel");
const PropertiesLandsModel = require("../Models/PropertiesLandsModel");
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const {client} = require('../Utils/redisClient')

exports.createCategoryLand = async (req, res) => {
  try {
    const { title, price, location, lang } = req.body || {};

    
    if (!title || !price || !location || !lang) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Title, price, location, and language are required",
        ])
      );
    }

    
    const validationErrors = validateInput({ title, price, location, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }

  
    const image = req.file?.filename || null;

   
    const newCategoryLand = await CategoriesLandsModel.create({
      title,
      price,
      location,
      lang,
      image,
    });

    
    const cacheDeletePromises = [client.del(`categoryLands:page:1:limit:20`)];
    await Promise.all(cacheDeletePromises);

    
    await client.set(`categoryLand:${newCategoryLand.id}`, JSON.stringify(newCategoryLand), {
      EX: 3600,
    });

   
    res.status(201).json(
    newCategoryLand,
    );
  } catch (error) {
    console.error("Error in createCategoryLand:", error.message);
    res.status(500).json(
      ErrorResponse("Failed to create Category Land", [
        "An internal server error occurred.",
      ])
    );
  }
};


exports.getAllCategoryLands = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { lang } = req.params;

    const validationErrors = validateInput({ lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid language', validationErrors));
    }

    
    const cacheKey = `categoryLands:lang:${lang}:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

   
    const categoryLands = await CategoriesLandsModel.findAll({
      where: { lang },
      include: [
        {
          model: PropertiesLandsModel,
          as: "PropertiesLands",
          attributes: ["id", "property", "image"], 
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]], 
    });

    
    if (!categoryLands || categoryLands.length === 0) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "No Category Lands found" : "لا توجد فئات"));
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(categoryLands));

    
    res.status(200).json(
      categoryLands,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Category Lands'));
  }
};


exports.getCategoryLandById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    const validationErrors = validateInput({ id, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid ID or language', validationErrors));
    }

    const cacheKey = `categoryLand:${id}:${lang}`;

  
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for category land:", id);
      return res.status(200).json(
       
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for category land:", id);

    
    const categoryLand = await CategoriesLandsModel.findOne({
      where: { id, lang },
    });

    if (!categoryLand) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة"));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(categoryLand));

    
    return res.status(200).json(
      categoryLand,
    );
  } catch (error) {
    console.error("Error in getCategoryLandById:", error);
    return res.status(500).json(
      new ErrorResponse("Failed to retrieve Category Land", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};


exports.updateCategoryLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, location, lang } = req.body;
    const image = req.file?.filename || null;

    
    const validationErrors = validateInput({ title, price, location, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid input', validationErrors));
    }

    
    const categoryLand = await CategoriesLandsModel.findByPk(id);
    if (!categoryLand) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة"));
    }

   
    const updatedFields = {};
    if (title && title !== categoryLand.title) updatedFields.title = title;
    if (price && price !== categoryLand.price) updatedFields.price = price;
    if (location && location !== categoryLand.location) updatedFields.location = location;
    if (lang && lang !== categoryLand.lang) updatedFields.lang = lang;
    if (image && image !== categoryLand.image) updatedFields.image = image;

 
    if (Object.keys(updatedFields).length > 0) {
      await categoryLand.update(updatedFields);
    }

    
    const updatedData = categoryLand.toJSON();
    const cacheKey = `categoryLand:${id}:${lang}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));


    res.status(200).json(
      updatedData,
    );
  } catch (error) {
    console.error("Error in updateCategoryLand:", error);
    res.status(500).json(new ErrorResponse('Failed to update Category Land', [
      "An internal server error occurred. Please try again later.",
    ]));
  }
};


exports.deleteCategoryLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const [categoryLand, _] = await Promise.all([
      CategoriesLandsModel.findOne({ where: { id, lang } }),
      client.del(`categoryLand:${id}:${lang}`),
    ]);

    if (!categoryLand) {
      return res.status(404).json(
         ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة", [
          "No Category Land found with the given ID and language.",
        ])
      );
    }

   
    await categoryLand.destroy();

    
    return res.status(200).json({ message: lang === "en" ? "Category Land deleted successfully" : "تم حذف الفئة بنجاح" });
  } catch (error) {
    console.error("Error in deleteCategoryLand:", error);

    
    return res.status(500).json(
       ErrorResponse("Failed to delete Category Land", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

