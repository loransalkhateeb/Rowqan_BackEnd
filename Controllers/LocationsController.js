const Location = require('../Models/LocationModel');
const Chalet = require('../Models/ChaletsModel');
const { Op } = require('sequelize');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');

exports.createLocation = async (req, res) => {
  try {
    const { location, lang } = req.body;

    const validationErrors = validateInput(
      { location, lang },
      ["location", "lang"]
    );
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const newLocation = await Location.create({
      location,
      lang,
    });

    res.status(201).json(
       newLocation,
    );
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json(ErrorResponse("Failed to create location."));
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const { lang } = req.query;

    if (!lang) {
      return res.status(400).json(ErrorResponse("Language is required."));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const locations = await Location.findAll({
      where: {
        lang,
      },
    });

    if (locations.length === 0) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "No locations found" : "لم يتم العثور على مواقع"));
    }

    res.status(200).json(
      locations,
    );
  } catch (error) {
    console.error("Error retrieving locations:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve locations."));
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const validationErrors = validateInput({ id, lang }, ["id", "lang"]);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const location = await Location.findOne({
      where: {
        id,
        lang,
      },
    });

    if (!location) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "Location not found" : "الموقع غير موجود"));
    }

    res.status(200).json(
      location,
    );
  } catch (error) {
    console.error("Error retrieving location:", error);
    res.status(500).json(ErrorResponse("Failed to retrieve location."));
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, lang } = req.body;

    const locationToUpdate = await Location.findByPk(id);

    if (!locationToUpdate) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "Location not found" : "الموقع غير موجود"));
    }

    if (lang && !["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    locationToUpdate.location = location || locationToUpdate.location;
    locationToUpdate.lang = lang || locationToUpdate.lang;

    await locationToUpdate.save();

    res.status(200).json({
      message: lang === "en" ? "Location updated successfully" : "تم تحديث الموقع بنجاح",
      location: locationToUpdate,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json(ErrorResponse("Failed to update location."));
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const locationToDelete = await Location.findByPk(id);

    if (!locationToDelete) {
      return res.status(404).json(ErrorResponse("Location not found"));
    }

    await locationToDelete.destroy();

    res.status(200).json({
      message: locationToDelete.lang === "en" ? "Location deleted successfully" : "تم حذف الموقع بنجاح",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json(ErrorResponse("Failed to delete location."));
  }
};

exports.getLocationsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    const validationErrors = validateInput({ chalet_id, lang }, ["chalet_id", "lang"]);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!["ar", "en"].includes(lang)) {
      return res.status(400).json(ErrorResponse("Invalid language. Supported languages are 'ar' and 'en'."));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "Chalet not found" : "الشاليه غير موجود"));
    }

    const locations = await Location.findAll({
      where: {
        chalet_id,
        lang,
      },
    });

    if (locations.length === 0) {
      return res.status(404).json(ErrorResponse(lang === "en" ? "No locations found for this chalet and language" : "لم يتم العثور على مواقع لهذا الشاليه واللغة"));
    }

    res.status(200).json({
      message: lang === "en" ? "Locations retrieved successfully" : "تم استرجاع المواقع بنجاح",
      locations,
    });
  } catch (error) {
    console.error("Error fetching locations by chalet:", error);
    res.status(500).json(ErrorResponse("Failed to fetch locations."));
  }
};