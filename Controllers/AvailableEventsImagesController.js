const Available_Events_Images = require("../Models/Available_Events_Images");
const Available_Events = require("../Models/AvailableEvents");
const multer = require("../Config/Multer");
const path = require("path");
const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const {client} = require('../Utils/redisClient')

exports.createAvailableEventImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json(ErrorResponse("At least one image is required"));
    }

    const { event_id } = req.body;

    const validationErrors = validateInput({ event_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    const event = await Available_Events.findByPk(event_id, {
      attributes: ["id"],
    });
    
    if (!event) {
      return res.status(404).json(ErrorResponse("Event not found"));
    }

    const images = req.files.map((file) => ({
      image: file.filename,
      event_id,
    }));

    const newImages = await Available_Events_Images.bulkCreate(images);

    const cacheDeletePromises = [
      client.del(`AvailableEventImages:${event_id}`),
    ];

    await Promise.all([...cacheDeletePromises]);

    await client.set(
      `AvailableEventImages:${newImages.id}`,
      JSON.stringify(newImages),
      {
        EX: 3600,
      }
    );

    res.status(201).json(
       newImages,
    );
  } catch (error) {
    console.error("Error in createAvailableEventImages:", error);
    res
      .status(500)
      .json(ErrorResponse("Failed to add images to Available Event"));
  }
};

exports.getAvailableEventImages = async (req, res) => {
  try {
    const { event_id } = req.params;

    const cacheKey = `availableEventImages:${event_id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for event images:", event_id);
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for event images:", event_id);

    
    const event = await Available_Events.findByPk(event_id);

    if (!event) {
      return res.status(404).json( ErrorResponse("Event not found"));
    }

    const images = await Available_Events_Images.findAll({
      attributes: ["id", "image"],
      where: { event_id },
    });

    if (images.length === 0) {
      return res
        .status(404)
        .json( ErrorResponse("No images found for this event"));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(images));

    
    return res.status(200).json(
      images);
  } catch (error) {
    console.error("Error in getAvailableEventImages:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve images"));
  }
};




exports.updateAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id } = req.body;

    const validationErrors = validateInput({ event_id, id });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const [image, event] = await Promise.all([
      Available_Events_Images.findByPk(id),
      Available_Events.findByPk(event_id)
    ]);

    
    if (!image) {
      return res.status(404).json(ErrorResponse("Image not found"));
    }
    if (!event) {
      return res.status(404).json(ErrorResponse("Event not found"));
    }

    
    const updatedFields = {};
    if (event_id && event_id !== image.event_id) updatedFields.event_id = event_id;
    if (req.file && req.file.filename !== image.image) updatedFields.image = req.file.filename;

   
    if (Object.keys(updatedFields).length > 0) {
      await image.update(updatedFields);
    }

   
    const updatedData = image.toJSON();
    const cacheKey = `availableEventImage:${id}`;
    
    
    client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error in updateAvailableEventImage:", error);
    res.status(500).json(ErrorResponse("Failed to update image"));
  }
};




exports.deleteAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params;

  
    const [image, _] = await Promise.all([
      Available_Events_Images.findByPk(id),
      client.del(`availableEventImage:${id}`),
    ]);

    if (!image) {
      return res.status(404).json(
        new ErrorResponse("Image not found", [
          "No image found with the given ID.",
        ])
      );
    }

    await image.destroy();
    
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAvailableEventImage:", error);

    
    return res.status(500).json(
      new ErrorResponse("Failed to delete image", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

