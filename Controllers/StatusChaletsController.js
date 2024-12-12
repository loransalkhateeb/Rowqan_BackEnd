const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const StatusChalets = require('../Models/StatusChalets');
const path = require('path');

exports.createStatusChalet = async (req, res) => {
  try {
    const { title } = req.body;
    const image = req.file ? req.file.filename : null;

   
    const validationErrors = validateInput({ title });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    
    const existingStatusChalet = await StatusChalets.findOne({ where: { title } });
    if (existingStatusChalet) {
      return res.status(400).json(new ErrorResponse('StatusChalet with the same title already exists'));
    }

    const newStatusChalet = await StatusChalets.create({
      title,
      image,
    });

    res.status(201).json({
      message: 'StatusChalet created successfully',
      statusChalet: newStatusChalet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create StatusChalet'));
  }
};

exports.getAllStatusChalets = async (req, res) => {
  try {
    const statusChalets = await StatusChalets.findAll();

    if (!statusChalets.length) {
      return res.status(404).json(new ErrorResponse('No StatusChalets found'));
    }

    res.status(200).json({ statusChalets });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve StatusChalets'));
  }
};

exports.updateStatusChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const image = req.file ? req.file.filename : null;

    const statusChalet = await StatusChalets.findOne({ where: { id } });

    if (!statusChalet) {
      return res.status(404).json(new ErrorResponse('StatusChalet not found'));
    }

    
    const validationErrors = validateInput({ title });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    statusChalet.title = title || statusChalet.title;
    statusChalet.image = image || statusChalet.image;

    await statusChalet.save();

    res.status(200).json({ message: 'StatusChalet updated successfully', statusChalet });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update StatusChalet'));
  }
};

exports.getStatusChaletById = async (req, res) => {
  try {
    const { id } = req.params;

    const statusChalet = await StatusChalets.findOne({ where: { id } });

    if (!statusChalet) {
      return res.status(404).json(new ErrorResponse('StatusChalet not found'));
    }

    res.status(200).json({ statusChalet });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch StatusChalet'));
  }
};

exports.deleteStatusChalet = async (req, res) => {
  try {
    const { id } = req.params;

    const statusChalet = await StatusChalets.findOne({ where: { id } });

    if (!statusChalet) {
      return res.status(404).json(new ErrorResponse('StatusChalet not found'));
    }

    await statusChalet.destroy();

    res.status(200).json({ message: 'StatusChalet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete StatusChalet'));
  }
};
