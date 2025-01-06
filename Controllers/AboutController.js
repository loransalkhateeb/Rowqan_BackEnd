const About = require('../Models/AboutModel')
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const { client } = require("../Utils/redisClient");


exports.createAbout = async (req, res) => {
    try {
      const { title, description,lang } = req.body || {};
      const image = req.file?.filename || null;
      if (!title || !description || !lang || !image) {
        return res
          .status(400)
          .json(
            ErrorResponse("Validation failed", [
              "All Fields are required",
            ])
          );
      }
  
  
      const validationErrors = validateInput({ title, description,lang });
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json(ErrorResponse("Validation failed", validationErrors));
      }
  
      const newAboutPromise = About.create({ title, description,lang,image });
  
      const cacheDeletePromises = [client.del(`about:page:1:limit:20`)];
  
      const [newAbout] = await Promise.all([
        newAboutPromise,
        ...cacheDeletePromises,
      ]);
  
      await client.set(`about:${newAbout.id}`, JSON.stringify(newAbout), {
        EX: 3600,
      });
  
      res.status(201).json({
        message: "About Us created successfully",
        about: newAbout,
      });
    } catch (error) {
      console.error("Error in createAbout:", error.message);
      res
        .status(500)
        .json(
          ErrorResponse("Failed to create Hero", [
            "An internal server error occurred.",
          ])
        );
    }
  };
  


  exports.getAbout = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const {lang} = req.params
      const offset = (page - 1) * limit;
  
      
      const cacheKey = `about:page:${page}:limit:${limit}:lang:${lang || 'all'}`;
  
     
      client.del(cacheKey);
  
      
      const cachedData = await client.get(cacheKey);
  
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
  
      
      const whereCondition = lang ? { lang } : {};
  
      const aboutEntries = await About.findAll({
        attributes: ["id", "title", "description", "lang", "image"],
        where: whereCondition, 
        order: [["id", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      
      await client.setEx(cacheKey, 3600, JSON.stringify(aboutEntries));
  
      res.status(200).json(aboutEntries);
    } catch (error) {
      console.error("Error in getAbout:", error.message);
      res
        .status(500)
        .json(
          ErrorResponse("Failed to fetch About entries", [
            "An internal server error occurred.",
          ])
        );
    }
  };
  

  exports.getAboutById = async (req, res) => {
    try {
      const { id } = req.params;
      const { lang } = req.query;
  
      
      const cacheKey = `about:${id}:lang:${lang || 'all'}`;
  
      
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
  
      
      const whereCondition = lang ? { id, lang } : { id };
  
      
      const aboutEntry = await About.findOne({
        attributes: ["id", "title", "description", "lang", "image"],
        where: whereCondition,
      });
  
      
      if (!aboutEntry) {
        return res
          .status(404)
          .json(
            ErrorResponse("About entry not found", [
              "No About entry found with the given ID and language.",
            ])
          );
      }
  
      
      await client.setEx(cacheKey, 3600, JSON.stringify(aboutEntry));
  
      
      return res.status(200).json(aboutEntry);
    } catch (error) {
      console.error("Error in getAboutById:", error);
  
      
      return res
        .status(500)
        .json(
          ErrorResponse("Failed to fetch About entry", [
            "An internal server error occurred. Please try again later.",
          ])
        );
    }
  };
  
  

  exports.updateAbout = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description,lang } = req.body;
      const image = req.file?.filename || null;
  
     
      const validationErrors = validateInput({ title, description,lang });
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json(ErrorResponse("Validation failed", validationErrors));
      }
  
      
      const aboutEntry = await About.findByPk(id);
      if (!aboutEntry) {
        return res
          .status(404)
          .json(
            ErrorResponse("About entry not found", [
              "No About entry found with the given ID.",
            ])
          );
      }
  
      
      const updatedFields = {};
      if (title && title !== aboutEntry.title) updatedFields.title = title;
      if (description && description !== aboutEntry.description) updatedFields.description = description;
      if (image) updatedFields.image = image;
  
      
      if (Object.keys(updatedFields).length > 0) {
        await aboutEntry.update(updatedFields);
      }
  
     
      const updatedData = aboutEntry.toJSON();
      const cacheKey = `about:${id}`;
      await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));
  
     
      return res.status(200).json({
        message: "About entry updated successfully",
        aboutEntry: updatedData,
      });
    } catch (error) {
      console.error("Error in updateAbout:", error);
  
      return res
        .status(500)
        .json(
          ErrorResponse("Failed to update About entry", [
            "An internal server error occurred. Please try again later.",
          ])
        );
    }
  };




  exports.deleteAbout = async (req, res) => {
    try {
      const { id } = req.params;
      const { lang } = req.query;
      
      const whereCondition = lang ? { id, lang } : { id };
  
      
      const aboutEntry = await About.findOne({ where: whereCondition });
  
      if (!aboutEntry) {
        return res.status(404).json(
          ErrorResponse("About entry not found", [
            "No About entry found with the given ID and language.",
          ])
        );
      }
  
      
      const cacheKey = `about:${id}:lang:${lang || 'all'}`;
      await client.del(cacheKey);
  
      
      await aboutEntry.destroy();
  
      return res.status(200).json({ message: "About entry deleted successfully" });
    } catch (error) {
      console.error("Error in deleteAbout:", error);
  
      return res.status(500).json(
        ErrorResponse("Failed to delete About entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
    }
  };
  