const express = require('express');
const router = express.Router();
const CategoriesImageLandsController = require('../Controllers/CategoriesImagesController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createimageland', authMiddleware, rateLimiter, multer.array('image'), CategoriesImageLandsController.createAvailableLandsImages);
router.put('/updateImageCategory/:id', authMiddleware, rateLimiter, multer.single('image'), CategoriesImageLandsController.updateCategoryImageLand);


router.get('/getImagesByCategoryId/:category_id', authMiddleware, CategoriesImageLandsController.getAllCategoryImageLands);
router.get('/getimagesById/:id', authMiddleware, CategoriesImageLandsController.getCategoryImageLandById);
router.delete('/deleteImage/:id', authMiddleware, CategoriesImageLandsController.deleteCategoryImageLand);

module.exports = router;
