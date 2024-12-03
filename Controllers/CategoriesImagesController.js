const CategoriesImageLands = require('../Models/Categories_image_Lands');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');

// Create a new Category Image Land
exports.createCategoryImageLand = async (req, res) => {
  try {
    const { category_id } = req.body;

  

      const image = req.file ? req.file.filename : null;

      const newCategoryImageLand = await CategoriesImageLands.create({
        image,
        category_id,
      });

      res.status(201).json({
        message: 'Category Image Land created successfully',
        categoryImageLand: newCategoryImageLand,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Category Image Land' });
  }
};


exports.getAllCategoryImageLands = async (req, res) => {
    try {
      const { category_id } = req.params; 
  
      const filter = category_id ? { category_id } : {}; 
  
      const categoryImageLands = await CategoriesImageLands.findAll({
        where: filter,
        include: {
          model: CategoriesLandsModel,
          attributes: ['id', 'title'],
        },
      });
  
      if (categoryImageLands.length === 0) {
        return res.status(404).json({
          error: 'No Category Image Lands found for the specified category',
        });
      }
  
      res.status(200).json(
        categoryImageLands,
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve Category Image Lands' });
    }
  };
  

exports.getCategoryImageLandById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryImageLand = await CategoriesImageLands.findOne({
      where: { id },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'], // Include related category fields
      },
    });

    if (!categoryImageLand) {
      return res.status(404).json({ error: 'Category Image Land not found' });
    }

    res.status(200).json({
      message: 'Category Image Land retrieved successfully',
      categoryImageLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Category Image Land' });
  }
};

// Update a Category Image Land
exports.updateCategoryImageLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;


      const image = req.file ? req.file.filename : null;

      const categoryImageLand = await CategoriesImageLands.findByPk(id);
      if (!categoryImageLand) {
        return res.status(404).json({ error: 'Category Image Land not found' });
      }

      // Update fields
      categoryImageLand.image = image || categoryImageLand.image;
      categoryImageLand.category_id = category_id || categoryImageLand.category_id;

      await categoryImageLand.save();

      res.status(200).json({
        message: 'Category Image Land updated successfully',
        categoryImageLand,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Category Image Land' });
  }
};

// Delete a Category Image Land
exports.deleteCategoryImageLand = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryImageLand = await CategoriesImageLands.findByPk(id);
    if (!categoryImageLand) {
      return res.status(404).json({ error: 'Category Image Land not found' });
    }

    await categoryImageLand.destroy();

    res.status(200).json({
      message: 'Category Image Land deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete Category Image Land' });
  }
};
