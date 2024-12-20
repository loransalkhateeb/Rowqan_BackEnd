const Available_Events_Images = require('../Models/Available_Events_Images');
const Available_Events = require('../Models/AvailableEvents');
const multer = require('../Config/Multer'); 
const path = require('path');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createAvailableEventImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(new ErrorResponse('At least one image is required'));
    }

    const { event_id } = req.body;
    const validationErrors = validateInput({ event_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json(new ErrorResponse('Event not found'));
    }

    const images = req.files.map(file => ({
      image: file.filename,
      event_id
    }));

    const newImages = await Available_Events_Images.bulkCreate(images);

    res.status(201).json({
      message: 'Images added to Available Event successfully',
      images: newImages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to add images to Available Event'));
  }
};

exports.getAvailableEventImages = async (req, res) => {
  try {
    const { event_id } = req.params;

    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json(new ErrorResponse('Event not found'));
    }

    const images = await Available_Events_Images.findAll({
      where: { event_id },
    });

    if (images.length === 0) {
      return res.status(404).json(new ErrorResponse('No images found for this event'));
    }

    res.status(200).json({
      message: 'Images retrieved successfully',
      images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve images'));
  }
};

exports.updateAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id } = req.body;

    const validationErrors = validateInput({ event_id, id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    const image = await Available_Events_Images.findByPk(id);
    if (!image) {
      return res.status(404).json(new ErrorResponse('Image not found'));
    }

    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json(new ErrorResponse('Event not found'));
    }

    const updatedImage = await image.update({
      image: req.file ? req.file.filename : image.image,
      event_id,
    });

    res.status(200).json({
      message: 'Image updated successfully',
      image: updatedImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update image'));
  }
};

exports.deleteAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Available_Events_Images.findByPk(id);
    if (!image) {
      return res.status(404).json(new ErrorResponse('Image not found'));
    }

    await image.destroy();

    res.status(200).json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete image'));
  }
};
