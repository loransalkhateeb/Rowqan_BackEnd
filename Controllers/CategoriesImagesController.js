const CategoriesImageLands = require('../Models/Categories_image_Lands');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createAvailableLandsImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(new ErrorResponse('At least one image is required'));
    }

    const { category_id } = req.body;

 
    const validationErrors = validateInput({ category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid input', validationErrors));
    }

    const land = await CategoriesLandsModel.findByPk(category_id);
    if (!land) {
      return res.status(404).json(new ErrorResponse('Land not found'));
    }

    const images = req.files.map(file => ({
      image: file.filename,
      category_id
    }));

    const newImages = await CategoriesImageLands.bulkCreate(images);

    res.status(201).json({
      message: 'Images added to Available Lands successfully',
      images: newImages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to add images to Available Lands'));
  }
};

exports.getAllCategoryImageLands = async (req, res) => {
  try {
    const { category_id } = req.params;

 
    const validationErrors = validateInput({ category_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid category_id', validationErrors));
    }

    const filter = category_id ? { category_id } : {};

    const categoryImageLands = await CategoriesImageLands.findAll({
      where: filter,
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title', 'price', 'location'],
      },
    });

    if (categoryImageLands.length === 0) {
      return res.status(404).json(new ErrorResponse('No Category Image Lands found for the specified category'));
    }

    res.status(200).json(categoryImageLands);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Category Image Lands'));
  }
};

exports.getCategoryImageLandById = async (req, res) => {
  try {
    const { id } = req.params;


    const validationErrors = validateInput({ id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid ID', validationErrors));
    }

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

    res.status(200).json({
      message: 'Category Image Land retrieved successfully',
      categoryImageLand,
    });
  } catch (error) {
    console.error(error);
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

    const image = req.file ? req.file.filename : null;

    const categoryImageLand = await CategoriesImageLands.findByPk(id);
    if (!categoryImageLand) {
      return res.status(404).json(new ErrorResponse('Category Image Land not found'));
    }

    categoryImageLand.image = image || categoryImageLand.image;
    categoryImageLand.category_id = category_id || categoryImageLand.category_id;

    await categoryImageLand.save();

    res.status(200).json({
      message: 'Category Image Land updated successfully',
      categoryImageLand,
    });
  } catch (error) {
    console.error(error);
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

    const categoryImageLand = await CategoriesImageLands.findByPk(id);
    if (!categoryImageLand) {
      return res.status(404).json(new ErrorResponse('Category Image Land not found'));
    }

    await categoryImageLand.destroy();

    res.status(200).json({
      message: 'Category Image Land deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete Category Image Land'));
  }
};
