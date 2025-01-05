const CategoriesImageLands = require('../Models/Categories_image_Lands');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')


exports.createAvailableLandsImages = async (req, res) => {
  try {
    const { category_id } = req.body || {};

    if (!req.files || req.files.length === 0) {
      return res.status(400).json( ErrorResponse('At least one image is required'));
    }
    
    const validationErrors = validateInput({ category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json( ErrorResponse('Invalid input', validationErrors));
    }

    
    const land = await CategoriesLandsModel.findByPk(category_id);
    if (!land) {
      return res.status(404).json( ErrorResponse('Land not found'));
    }

    
    const images = req.files.map(file => ({
      image: file.filename,
      category_id
    }));

    
    const newImagesPromise = CategoriesImageLands.bulkCreate(images);

    
    const cacheDeletePromises = [client.del(`availableLands:${category_id}`)];

    const [newImages] = await Promise.all([newImagesPromise, ...cacheDeletePromises]);

    
    await client.setEx(`availableLands:${category_id}`, 3600, JSON.stringify(newImages));

   
    res.status(201).json( newImages
    );
  } catch (error) {
    console.error("Error in createAvailableLandsImages:", error.message);
    res.status(500).json( ErrorResponse('Failed to add images to Available Lands'));
  }
};



exports.getAllCategoryImageLands = async (req, res) => {
  try {
    const { category_id } = req.params;

    const validationErrors = validateInput({ category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid category_id', validationErrors));
    }

    const cacheKey = `categoryImageLands:${category_id}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for category image lands:", category_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for category image lands:", category_id);

    const filter = category_id ? { category_id } : {};
    const categoryImageLands = await CategoriesImageLands.findAll({
      where: filter,
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title', 'price', 'location'],
      },
    });

    if (categoryImageLands.length === 0) {
      return res.status(404).json( ErrorResponse('No Category Image Lands found for the specified category'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(categoryImageLands));

    
    res.status(200).json(categoryImageLands);
  } catch (error) {
    console.error("Error in getAllCategoryImageLands:", error);
    res.status(500).json( ErrorResponse('Failed to retrieve Category Image Lands'));
  }
};


exports.getCategoryImageLandById = async (req, res) => {
  try {
    const { id } = req.params;

    
    const validationErrors = validateInput({ id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid ID', validationErrors));
    }

    const cacheKey = `categoryImageLand:${id}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for category image land:", id);
      return res.status(200).json( JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for category image land:", id);

    
    const categoryImageLand = await CategoriesImageLands.findOne({
      where: { id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!categoryImageLand) {
      return res.status(404).json(new ErrorResponse('Category Image Land not found'));
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(categoryImageLand));

    
    res.status(200).json(
      categoryImageLand,
    );
  } catch (error) {
    console.error("Error in getCategoryImageLandById:", error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Category Image Land'));
  }
};


exports.updateCategoryImageLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;

    
    const validationErrors = validateInput({ category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid input', validationErrors));
    }

    const image = req.file?.filename || null;

    
    const categoryImageLand = await CategoriesImageLands.findByPk(id);
    if (!categoryImageLand) {
      return res.status(404).json(new ErrorResponse('Category Image Land not found'));
    }

    
    const updatedFields = {};
    if (category_id && category_id !== categoryImageLand.category_id) updatedFields.category_id = category_id;
    if (image && image !== categoryImageLand.image) updatedFields.image = image;

    
    if (Object.keys(updatedFields).length > 0) {
      await categoryImageLand.update(updatedFields);
    }

    
    const updatedData = categoryImageLand.toJSON();
    const cacheKey = `categoryImageLand:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

   
    res.status(200).json(
    updatedData,
    );
  } catch (error) {
    console.error("Error in updateCategoryImageLand:", error);
    res.status(500).json(new ErrorResponse('Failed to update Category Image Land'));
  }
};


exports.deleteCategoryImageLand = async (req, res) => {
  try {
    const { id } = req.params;

    const validationErrors = validateInput({ id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid ID', validationErrors));
    }

    const [categoryImageLand, _] = await Promise.all([
      CategoriesImageLands.findByPk(id),
      client.del(`categoryImageLand:${id}`),
    ]);

    if (!categoryImageLand) {
      return res.status(404).json(new ErrorResponse('Category Image Land not found'));
    }

    await categoryImageLand.destroy();

    return res.status(200).json({
      message: 'Category Image Land deleted successfully',
    });
  } catch (error) {
    console.error("Error in deleteCategoryImageLand:", error);
   
    return res.status(500).json(
      new ErrorResponse('Failed to delete Category Image Land', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};

