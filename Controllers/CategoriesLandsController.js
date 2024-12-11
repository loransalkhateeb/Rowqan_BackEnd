const CategoriesLandsModel = require("../Models/CategoriesLandsModel");
const PropertiesLandsModel = require("../Models/PropertiesLandsModel");
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createCategoryLand = async (req, res) => {
  try {
    const { title, price, location, lang } = req.body;


    const validationErrors = validateInput({ title, price, location, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid input', validationErrors));
    }

    const image = req.file ? req.file.filename : null;

    const newCategoryLand = await CategoriesLandsModel.create({
      title,
      price,
      location,
      lang,
      image,
    });

    res.status(201).json({
      message: lang === "en" ? "Category Land created successfully" : "تم إنشاء الفئة بنجاح",
      categoryLand: newCategoryLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create Category Land'));
  }
};

exports.getAllCategoryLands = async (req, res) => {
  try {
    const { lang } = req.params;


    const validationErrors = validateInput({ lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid language', validationErrors));
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
    });

    if (!categoryLands || categoryLands.length === 0) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "No Category Lands found" : "لا توجد فئات"));
    }

    res.status(200).json({
      message: lang === "en" ? "Category Lands retrieved successfully" : "تم استرجاع الفئات بنجاح",
      categoryLands,
    });
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

    const categoryLand = await CategoriesLandsModel.findOne({
      where: { id, lang },
    });

    if (!categoryLand) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة"));
    }

    res.status(200).json({
      message: lang === "en" ? "Category Land retrieved successfully" : "تم استرجاع الفئة بنجاح",
      categoryLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Category Land'));
  }
};

exports.updateCategoryLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, location, lang } = req.body;


    const validationErrors = validateInput({ title, price, location, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid input', validationErrors));
    }

    const image = req.file ? req.file.filename : null;

    const categoryLand = await CategoriesLandsModel.findByPk(id);
    if (!categoryLand) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة"));
    }

    categoryLand.title = title || categoryLand.title;
    categoryLand.price = price || categoryLand.price;
    categoryLand.location = location || categoryLand.location;
    categoryLand.lang = lang || categoryLand.lang;
    categoryLand.image = image || categoryLand.image;

    await categoryLand.save();

    res.status(200).json({
      message: lang === "en" ? "Category Land updated successfully" : "تم تحديث الفئة بنجاح",
      categoryLand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Category Land'));
  }
};

exports.deleteCategoryLand = async (req, res) => {
  try {
    const { id, lang } = req.params;

  
    const validationErrors = validateInput({ id, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Invalid ID or language', validationErrors));
    }

    const categoryLand = await CategoriesLandsModel.findOne({
      where: { id, lang },
    });

    if (!categoryLand) {
      return res.status(404).json(new ErrorResponse(lang === "en" ? "Category Land not found" : "الفئة غير موجودة"));
    }

    await categoryLand.destroy();

    res.status(200).json({
      message: lang === "en" ? "Category Land deleted successfully" : "تم حذف الفئة بنجاح",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete Category Land'));
  }
};
