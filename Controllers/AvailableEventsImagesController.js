const Available_Events_Images = require('../Models/Available_Events_Images');
const Available_Events = require('../Models/AvailableEvents');
const multer = require('../Config/Multer'); 
const path = require('path');




exports.createAvailableEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { event_id } = req.body; 

    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }


    const newImage = await Available_Events_Images.create({
      image: req.file.filename,  
      event_id  
    });

    res.status(201).json({
      message: 'Image added to Available Event successfully',
      image: newImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add image to Available Event' });
  }
};





exports.getAvailableEventImages = async (req, res) => {
  try {
    const { event_id } = req.params;

    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }


    const images = await Available_Events_Images.findAll({
      where: { event_id },
    });

    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found for this event' });
    }

    res.status(200).json({
      message: 'Images retrieved successfully',
      images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
};





exports.updateAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params; 
    const { event_id } = req.body;


    const image = await Available_Events_Images.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }


    const event = await Available_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
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
    res.status(500).json({ error: 'Failed to update image' });
  }
};




exports.deleteAvailableEventImage = async (req, res) => {
  try {
    const { id } = req.params;


    const image = await Available_Events_Images.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }


    await image.destroy();

    res.status(200).json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
