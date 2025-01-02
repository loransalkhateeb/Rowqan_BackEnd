const Chalet = require('../Models/ChaletsModel');
const ChaletsImages = require('../Models/ChaletsImagesModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput'); 
const {client} = require('../Utils/redisClient')

exports.createChaletImages = async (req, res) => {
  try {
    const { chalet_id } = req.body;

    if (!chalet_id) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Chalet ID is required",
        ])
      );
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    
    if (images.length === 0) {
      return res.status(400).json(ErrorResponse('Images are required'));
    }

    
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

    
    const newImages = await ChaletsImages.bulkCreate(
      images.map((image) => ({ chalet_id, image }))
    );

   
    const cacheDeletePromises = [
      client.del(`chalet:${chalet_id}`), 
      client.del(`chaletsHero:page:1:limit:20`), 
    ];

    
    await Promise.all(cacheDeletePromises);

    
    const cacheKey = `chaletImages:${chalet_id}`;
    await client.set(cacheKey, JSON.stringify(newImages), { EX: 3600 });

    res.status(201).json(
      newImages,
    );
  } catch (error) {
    console.error('Error in createChaletImages:', error);
    res.status(500).json(ErrorResponse('Failed to create chalet images'));
  }
};


exports.getImagesByChaletId = async (req, res) => {
  try {
    const { chalet_id } = req.params;
client.del(`chaletImages:${chalet_id}`);
    const cacheKey = `chaletImages:${chalet_id}`;
   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet images:", chalet_id);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalet images:", chalet_id);

   
    const chaletImages = await ChaletsImages.findAll({
      where: { chalet_id },
      attributes: ['image'], 
    });

  
    if (!chaletImages.length) {
      return res.status(404).json(ErrorResponse('No images found for this chalet'));
    }

   
    const images = chaletImages.map((img) => img.image);
    await client.setEx(cacheKey, 3600, JSON.stringify(images));

    res.status(200).json(
     images,
    );
  } catch (error) {
    console.error("Error in getImagesByChaletId:", error);
    res.status(500).json(ErrorResponse('Failed to retrieve chalet images'));
  }
};



exports.updateChaletImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.file ? req.file.filename : null;

  
    if (!image) {
      return res.status(400).json(ErrorResponse('Image is required'));
    }

   
    const chaletImage = await ChaletsImages.findByPk(id);
    if (!chaletImage) {
      return res.status(404).json(ErrorResponse('Chalet image not found'));
    }

   
    chaletImage.image = image || chaletImage.image;

   
    await chaletImage.save();

    
    const cacheKey = `chaletImage:${id}`;
    await client.del(cacheKey);  
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletImage));

    res.status(200).json(
      chaletImage,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to update chalet image'));
  }
};


exports.deleteChaletImage = async (req, res) => {
  try {
    const { id } = req.params;

   
    const [chaletImage, _] = await Promise.all([
      ChaletsImages.findByPk(id),
      client.del(`chaletImage:${id}`), 
    ]);

    
    if (!chaletImage) {
      return res.status(404).json(
        ErrorResponse("Chalet image not found", [
          "No Chalet image found with the given ID.",
        ])
      );
    }

   
    await chaletImage.destroy();

   
    return res.status(200).json({ message: "Chalet image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteChaletImage:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Chalet image", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};



exports.getChaletImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `chaletImage:${id}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet image:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalet image:", id);

  
    const chaletImage = await ChaletsImages.findByPk(id);
    if (!chaletImage) {
      return res.status(404).json(ErrorResponse('Chalet image not found'));
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletImage));

    return res.status(200).json(
      chaletImage,
    );
  } catch (error) {
    console.error("Error in getChaletImageById:", error);
    return res.status(500).json(
      ErrorResponse('Failed to retrieve chalet image', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};

