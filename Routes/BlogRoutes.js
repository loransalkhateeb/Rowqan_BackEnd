const express = require('express');
const router = express.Router();
const multer = require('../Config/Multer'); 
const BlogController = require('../Controllers/BlogController'); 
const authMiddleware = require('../MiddleWares/authMiddleware');  
const rateLimiter = require('../MiddleWares/rateLimiter');  





router.post('/createBlog', multer.single('image'), BlogController.createBlog);

router.put('/updateBlog/:id', rateLimiter, multer.single('image'), BlogController.updateBlog);

router.get('/getAllBlogs/:lang', BlogController.getAllBlogs);


router.get('/getBlogById/:id/:lang', BlogController.getBlogById);


router.delete('/deleteBlog/:id/:lang', BlogController.deleteBlog);

module.exports = router;