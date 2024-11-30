const Location = require('../Models/LocationModel');
const Chalet = require('../Models/ChaletsModel'); 
const { Op } = require('sequelize');


exports.createLocation = async (req, res) => {
  try {
    const { location, lang } = req.body;

    if (!location || !lang) {
      return res.status(400).json({ error: 'Location and lang are required' });
    }

    const newLocation = await Location.create({
      location,
      lang,
    });

    res.status(201).json({
      message: 'Location created successfully',
      location: newLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};


exports.getAllLocations = async (req, res) => {
  try {
    const { lang } = req.query; 

    if (!lang) {
      return res.status(400).json({ error: 'Language is required' });
    }

    const locations = await Location.findAll({
      where: {
        lang: lang, 
      },
    });

    if (locations.length === 0) {
      return res.status(404).json({ error: 'No locations found for this language' });
    }

    res.status(200).json({ locations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve locations' });
  }
};


exports.getLocationById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const location = await Location.findOne({
      where: {
        id,
        lang,  
      },
    });

    if (!location) {
      return res.status(404).json({ error: `Location with id ${id} not found for language ${lang}` });
    }

    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve location' });
  }
};


exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, lang } = req.body;

    const locationToUpdate = await Location.findByPk(id);

    if (!locationToUpdate) {
      return res.status(404).json({ error: 'Location not found' });
    }

    locationToUpdate.location = location || locationToUpdate.location;
    locationToUpdate.lang = lang || locationToUpdate.lang;

    await locationToUpdate.save();

    res.status(200).json({ message: 'Location updated successfully', location: locationToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};


exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const locationToDelete = await Location.findByPk(id);

    if (!locationToDelete) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await locationToDelete.destroy();

    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};


exports.getLocationsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    const locations = await Location.findAll({
      where: {
        chalet_id, 
        lang,
      },
    });

    if (locations.length === 0) {
      return res.status(404).json({ error: 'No locations found for this chalet and language' });
    }

    res.status(200).json({ locations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};
