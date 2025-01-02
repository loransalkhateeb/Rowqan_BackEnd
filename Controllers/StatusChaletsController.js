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

    res.status(201).json(
     newStatusChalet,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create StatusChalet'));
  }
};

exports.getAllStatusChalets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `statusChalets:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }

    const statusChalets = await StatusChalets.findAll({
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!statusChalets.length) {
      return res.status(404).json({ error: "No StatusChalets found" });
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(statusChalets));

    res.status(200).json(
      statusChalets,
    );
  } catch (error) {
    console.error("Error in getAllStatusChalets:", error.message);
    res.status(500).json({
      error: "Failed to fetch StatusChalets entries",
      details: ["An internal server error occurred."],
    });
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

    const cacheKey = `statusChalet:${id}`;
    
   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for statusChalet:", id);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for statusChalet:", id);

    
    const statusChalet = await StatusChalets.findOne({ where: { id } });

    if (!statusChalet) {
      return res.status(404).json(
        new ErrorResponse("StatusChalet not found", [
          "No StatusChalet entry found with the given ID.",
        ])
      );
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(statusChalet));

    return res.status(200).json(statusChalet);
  } catch (error) {
    console.error("Error in getStatusChaletById:", error);
    
    return res.status(500).json(
       ErrorResponse("Failed to fetch StatusChalet entry", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};


exports.deleteStatusChalet = async (req, res) => {
  try {
    const { id } = req.params;

  
    const [statusChalet, _] = await Promise.all([
      StatusChalets.findByPk(id),
      client.del(`statusChalet:${id}`),  
    ]);

    if (!statusChalet) {
      return res.status(404).json(
        new ErrorResponse("StatusChalet not found", [
          "No StatusChalet entry found with the given ID.",
        ])
      );
    }


    await statusChalet.destroy();

    return res.status(200).json({ message: "StatusChalet deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStatusChalet:", error);

    return res.status(500).json(
      new ErrorResponse("Failed to delete StatusChalet", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};
