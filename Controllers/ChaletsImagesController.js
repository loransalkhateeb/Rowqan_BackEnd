const Chalet = require('../Models/ChaletsModel');
const ChaletsImages = require('../Models/ChaletsImagesModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput'); 


exports.createChaletImages = async (req, res) => {
  try {
    const { chalet_id } = req.body;

   
    const validationErrors = validateInput(req.body, ['chalet_id']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    if (images.length === 0) {
      return res.status(400).json(ErrorResponse('Images are required'));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

    const newImages = await Promise.all(
      images.map((image) => ChaletsImages.create({ chalet_id, image }))
    );

    res.status(201).json({
      message: 'Chalet images created successfully',
      chaletImages: newImages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to create chalet images'));
  }
};


exports.getImagesByChaletId = async (req, res) => {
  try {
    const { chalet_id } = req.params;

    const chaletImages = await ChaletsImages.findAll({
      where: { chalet_id },
      attributes: ['image'], 
    });

    if (!chaletImages.length) {
      return res.status(404).json(ErrorResponse('No images found for this chalet'));
    }

    res.status(200).json({
      message: 'Chalet images retrieved successfully',
      images: chaletImages.map((img) => img.image),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to retrieve chalet images'));
  }
};


exports.updateChaletImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.filename : null;

    const chaletImage = await ChaletsImages.findByPk(id);

    if (!chaletImage) {
      return res.status(404).json(ErrorResponse('Chalet image not found'));
    }

    chaletImage.image = image || chaletImage.image;

    await chaletImage.save();

    res.status(200).json({
      message: 'Chalet image updated successfully',
      chaletImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to update chalet image'));
  }
};


exports.deleteChaletImage = async (req, res) => {
  try {
    const { id } = req.params;

    const chaletImage = await ChaletsImages.findByPk(id);

    if (!chaletImage) {
      return res.status(404).json(ErrorResponse('Chalet image not found'));
    }

    await chaletImage.destroy();

    res.status(200).json({ message: 'Chalet image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to delete chalet image'));
  }
};


exports.getChaletImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const chaletImage = await ChaletsImages.findByPk(id);

    if (!chaletImage) {
      return res.status(404).json(ErrorResponse('Chalet image not found'));
    }

    res.status(200).json({ chaletImage });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to retrieve chalet image'));
  }
};
