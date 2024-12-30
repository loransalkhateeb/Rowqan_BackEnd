const express = require('express');
const router = express.Router();
const CategoriesImageLandsController = require('../Controllers/CategoriesImagesController');
const multer = require('../Config/Multer');
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter'); 


router.post('/createimageland', rateLimiter, multer.array('image'), CategoriesImageLandsController.createAvailableLandsImages);
router.put('/updateImageCategory/:id', rateLimiter, multer.single('image'), CategoriesImageLandsController.updateCategoryImageLand);


router.get('/getImagesByCategoryId/:category_id', CategoriesImageLandsController.getAllCategoryImageLands);
router.get('/getimagesById/:id', CategoriesImageLandsController.getCategoryImageLandById);
router.delete('/deleteImage/:id', CategoriesImageLandsController.deleteCategoryImageLand);

module.exports = router;
