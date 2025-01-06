const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const { client } = require("../Utils/redisClient");

const Blog = require('../Models/BlogModel')


exports.createBlog = async (req, res) => {
    try {
      const { title, description, lang } = req.body || {};
      const image = req.file?.filename || null;
  
      
      if (!title || !description || !lang || !image) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["All fields are required"])
        );
      }
  
      
      if (title.length < 3) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Title must be at least 3 characters long"])
        );
      }
      if (description.length < 10) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Description must be at least 10 characters long"])
        );
      }
      if (!["en", "ar", "fr"].includes(lang)) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Invalid language. Supported: en, ar, fr"])
        );
      }
  
      
      const newBlog = await Blog.create({
        title,
        description,
        lang,
        image,
      });
  
      
      return res.status(201).json({
        message: "Blog created successfully",
        blog: newBlog,
      });
    } catch (error) {
      console.error("Error in Creating Blog:", error.message);
  
      return res.status(500).json(
        ErrorResponse("Failed to create Blog", ["An internal server error occurred"])
      );
    }
  };



  exports.getAllBlogs = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query; 
      const offset = (page - 1) * limit; 
      const { lang } = req.params; 
  
      
      if (!lang || typeof lang !== "string") {
        return res
          .status(400)
          .json(new ErrorResponse("Invalid language", ["Language parameter is required and must be a string"]));
      }
  
      
      const cacheKey = `blogs:lang:${lang}:page:${page}:limit:${limit}`;
  
      
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit");
        return res.status(200).json(JSON.parse(cachedData));
      }
  
      console.log("Cache miss, querying database");
  
      
      const blogEntries = await Blog.findAll({
        where: { lang }, 
        attributes: ["id", "title", "description", "lang", "image"], 
        limit: parseInt(limit), 
        offset: parseInt(offset), 
        order: [["id", "DESC"]], 
      });
  
      
      if (!blogEntries.length) {
        return res
          .status(404)
          .json(new ErrorResponse(lang === "en" ? "No Blogs found" : "لا توجد مدونات"));
      }
  
    
      await client.setEx(cacheKey, 3600, JSON.stringify(blogEntries));
  
      
      return res.status(200).json(blogEntries);
    } catch (error) {
      console.error("Error in Get All Blogs:", error);
  
      return res
        .status(500)
        .json(
          new ErrorResponse("Failed to retrieve Blogs", [
            "An internal server error occurred. Please try again later.",
          ])
        );
    }
  };
  
  



  exports.getBlogById = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
    
      const validationErrors = validateInput({ id, lang });
      if (validationErrors.length > 0) {
        return res.status(400).json(new ErrorResponse('Invalid ID or language', validationErrors));
      }
  
      
      const cacheKey = `Blog:${id}:lang:${lang || 'all'}`;
  
     
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit for blog:", id);
        return res.status(200).json(JSON.parse(cachedData));
      }
      console.log("Cache miss for blog:", id);
  
     
      const whereCondition = lang ? { id, lang } : { id };
      const blogEntry = await Blog.findOne({
        attributes: ["id", "title", "description", "lang", "image"],
        where: whereCondition,
      });
  
      
      if (!blogEntry) {
        return res
          .status(404)
          .json( ErrorResponse("Blog entry not found", [
            "No Blog entry found with the given ID and language.",
          ]));
      }
  
      
      await client.setEx(cacheKey, 3600, JSON.stringify(blogEntry));
  
      
      return res.status(200).json(blogEntry);
    } catch (error) {
      console.error("Error in getBlogById:", error);
  
     
      return res
        .status(500)
        .json(new ErrorResponse("Failed to fetch Blog entry", [
          "An internal server error occurred. Please try again later.",
        ]));
    }
  };
  





  exports.updateBlog = async (req, res) => {
    try {
      const { id } = req.params; 
      const { title, description, lang } = req.body; 
      const image = req.file?.filename || null; 
  
      
      if (title && title.length < 3) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Title must be at least 3 characters long"])
        );
      }
      if (description && description.length < 10) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Description must be at least 10 characters long"])
        );
      }
      if (lang && !["en", "ar", "fr"].includes(lang)) {
        return res.status(400).json(
          ErrorResponse("Validation failed", ["Invalid language. Supported: en, ar, fr"])
        );
      }
  
      
      const blogEntry = await Blog.findByPk(id);
      if (!blogEntry) {
        return res.status(404).json(
          ErrorResponse("Blog entry not found", [
            "No Blog entry found with the given ID.",
          ])
        );
      }
  
      
      const updatedFields = {};
      if (title && title !== blogEntry.title) updatedFields.title = title;
      if (description && description !== blogEntry.description) updatedFields.description = description;
      if (lang && lang !== blogEntry.lang) updatedFields.lang = lang;
      if (image) updatedFields.image = image;
  
      
      if (Object.keys(updatedFields).length > 0) {
        await blogEntry.update(updatedFields);
      }
  
      
      return res.status(200).json({
        message: "Blog entry updated successfully",
        blogEntry: blogEntry.toJSON(),
      });
    } catch (error) {
      console.error("Error in updateBlog:", error);
  
      
      return res.status(500).json(
        ErrorResponse("Failed to update Blog entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
    }
  };
  



  exports.deleteBlog = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      
      const [blogEntry, _] = await Promise.all([
        Blog.findOne({ where: { id, lang } }),
        client.del(`Blog:${id}:lang:${lang || 'all'}`),
      ]);
  
      
      if (!blogEntry) {
        return res.status(404).json(
          ErrorResponse("Blog entry not found", [
            "No Blog entry found with the given ID and language.",
          ])
        );
      }
  
      
      await blogEntry.destroy();
  
      
      return res.status(200).json({ message: "Blog entry deleted successfully" });
    } catch (error) {
      console.error("Error in deleteBlog:", error);
  
      
      return res.status(500).json(
        ErrorResponse("Failed to delete Blog entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
    }
  };
  