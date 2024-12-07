const express = require('express');
const router = express.Router();
const CategoriesImageLandsController = require('../Controllers/CategoriesImagesController');
const multer = require('../Config/Multer');

router.post('/createimageland',multer.array('image'), CategoriesImageLandsController.createAvailableLandsImages);


router.get('/getImagesByCategoryId/:category_id', CategoriesImageLandsController.getAllCategoryImageLands);


router.get('/getimagesById/:id', CategoriesImageLandsController.getCategoryImageLandById);



router.put('/updateImageCategory/:id',multer.single('image'), CategoriesImageLandsController.updateCategoryImageLand);


router.delete('/deleteImage/:id', CategoriesImageLandsController.deleteCategoryImageLand);

module.exports = router;

