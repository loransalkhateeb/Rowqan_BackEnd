const BreifLandsModel = require('../Models/BriefLandsModel');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')


exports.createBreifLand = async (req, res) => {
  try {
    const { type, value, lang, category_id } = req.body || {};

    if (!type || !value || !lang || !category_id) {
      return res
        .status(400)
        .json(
          ErrorResponse("Validation failed", [
            "Type, value, lang, and category_id are required",
          ])
        );
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const category = await CategoriesLandsModel.findByPk(category_id);
    if (!category) {
      return res.status(404).json(new ErrorResponse('Category not found'));
    }

    const newBreifLandPromise = BreifLandsModel.create({
      type,
      value,
      lang,
      category_id,
    });

    const cacheDeletePromises = [
      client.del(`breifLand:category:${category_id}`), 
    ];

    const [newBreifLand] = await Promise.all([
      newBreifLandPromise,
      ...cacheDeletePromises,
    ]);

    await client.set(`breifLand:${newBreifLand.id}`, JSON.stringify(newBreifLand), {
      EX: 3600,
    });

    res.status(201).json( newBreifLand,
    );
  } catch (error) {
    console.error("Error in createBreifLand:", error.message);
    res
      .status(500)
      .json(
        ErrorResponse("Failed to create Breif Land", [
          "An internal server error occurred.",
        ])
      );
  }
};


exports.getAllBreifLandsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const cacheKey = `breifLands:category:${category_id}`;


    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for breif lands in category:", category_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for breif lands in category:", category_id);

    
    const breifLands = await BreifLandsModel.findAll({
      where: { category_id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (breifLands.length === 0) {
      return res.status(404).json( ErrorResponse('No Breif Lands found for this category'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(breifLands));

    return res.status(200).json(
      breifLands,
    );
  } catch (error) {
    console.error("Error in getAllBreifLandsByCategory:", error);

    return res.status(500).json(
      ErrorResponse("Failed to retrieve Breif Lands", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

exports.getBreifLandById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `breifLand:${id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for breif land:", id);
      return res.status(200).json( JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for breif land:", id);

    
    const breifLand = await BreifLandsModel.findOne({
      where: { id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!breifLand) {
      return res.status(404).json(new ErrorResponse('Breif Land not found'));
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(breifLand));

    return res.status(200).json(
      breifLand,
    );
  } catch (error) {
    console.error("Error in getBreifLandById:", error);

    return res.status(500).json(
      ErrorResponse("Failed to retrieve Breif Land", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};




exports.updateBreifLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, lang, category_id } = req.body;

    const validationErrors = validateInput({ type, value, lang, category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }


    const category = await CategoriesLandsModel.findByPk(category_id);
    if (!category) {
      return res.status(404).json(new ErrorResponse('Category not found'));
    }

    
    const breifLand = await BreifLandsModel.findByPk(id);
    if (!breifLand) {
      return res.status(404).json(new ErrorResponse('Breif Land not found'));
    }

  
    const updatedFields = {};
    if (type && type !== breifLand.type) updatedFields.type = type;
    if (value && value !== breifLand.value) updatedFields.value = value;
    if (lang && lang !== breifLand.lang) updatedFields.lang = lang;
    if (category_id && category_id !== breifLand.category_id) updatedFields.category_id = category_id;

    
    if (Object.keys(updatedFields).length > 0) {
      await breifLand.update(updatedFields);
    }

    
    const updatedData = breifLand.toJSON();
    const cacheKey = `breifLand:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    
    return res.status(200).json(
   
      updatedData,
    );
  } catch (error) {
    console.error("Error in updateBreifLand:", error);

    return res.status(500).json(
      new ErrorResponse('Failed to update Breif Land', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};



exports.deleteBreifLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    const [breifLand, _] = await Promise.all([
      BreifLandsModel.findOne({ where: { id, lang } }),
      client.del(`breifLand:${id}`), 
    ]);

    if (!breifLand) {
      return res.status(404).json(
        ErrorResponse(
          lang === 'en' ? 'Breif Land not found' : 'البيانات الموجزة غير موجودة'
        )
      );
    }

    
    await breifLand.destroy();


    res.status(200).json({
      message: lang === 'en' ? 'Breif Land deleted successfully' : 'تم حذف البيانات الموجزة بنجاح',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(
      ErrorResponse(
        lang === 'en' ? 'Failed to delete Breif Land' : 'فشل في حذف البيانات الموجزة'
      )
    );
  }
};


