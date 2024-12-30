const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const CategoriesLandsController = require('../Controllers/CategoriesLandsController');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createcategoryland', rateLimiter, multer.single('image'), CategoriesLandsController.createCategoryLand);
router.put('/UpdateCategoryLand/:id', rateLimiter, multer.single('image'), CategoriesLandsController.updateCategoryLand);


router.get('/getAllcategoryLand/:lang', CategoriesLandsController.getAllCategoryLands);
router.get('/getCategoryLandById/:id/:lang', CategoriesLandsController.getCategoryLandById);
router.delete('/DeleteCategoryLand/:id/:lang', CategoriesLandsController.deleteCategoryLand);

module.exports = router;
