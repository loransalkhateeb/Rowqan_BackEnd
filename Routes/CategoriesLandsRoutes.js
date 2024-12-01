const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const CategoriesLandsController = require('../Controllers/CategoriesLandsController');


router.post('/createcategoryland', multer.single('image'), CategoriesLandsController.createCategoryLand);


router.get('/getAllcategoryLand/:lang', CategoriesLandsController.getAllCategoryLands);


router.get('/getCategoryLandBtId/:id/:lang', CategoriesLandsController.getCategoryLandById);


router.put('/UpdateCategoryLand/:id', multer.single('image'), CategoriesLandsController.updateCategoryLand);


router.delete('/DeleteCategoryLand/:id/:lang', CategoriesLandsController.deleteCategoryLand);

module.exports = router;
