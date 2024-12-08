const Chalets_Props = require('../Models/ChaletsProps');
const Chalets = require('../Models/ChaletsModel');


 exports.createChaletProp = async (req, res) => {
  const { Chalet_Id, title, lang } = req.body;

  try {

    const chalet = await Chalets.findByPk(Chalet_Id);
    if (!chalet) {
      return res.status(404).json({ message: 'Chalet not found' });
    }


    const image = req.file ? req.file.path : null;

    
    const newProp = await Chalets_Props.create({
      Chalet_Id,
      image,
      title,
      lang,
    });

    res.status(201).json({ message: 'Property created successfully', data: newProp });
  } catch (error) {
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};


 exports.getAllChaletProps = async (req, res) => {
  const { lang } = req.params;

  try {
    const whereClause = lang ? { lang } : {};
    const properties = await Chalets_Props.findAll({
      where: whereClause,
    });

    res.status(200).json({ message: 'Properties fetched successfully', data: properties });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};


 exports.getChaletPropById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Chalets_Props.findByPk(id, {
      include: [
        {
          model: Chalets,
          attributes: ['id', 'name'], 
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({ message: 'Property fetched successfully', data: property });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, Chalet_Id, lang } = req.body;
      const image = req.file ? req.file.filename : null;
  
 
      if (!lang || !['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid or missing language, it should be "en" or "ar"' });
      }
  
  
      const property = await Chalets_Props.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
   
      const chalet = await Chalets.findByPk(Chalet_Id);
      if (!chalet) {
        return res.status(404).json({ error: 'Chalet not found' });
      }
  
  
      if (image) {
        property.image = image;
      }
  

      property.title = title || property.title;
      property.lang = lang || property.lang;
      property.Chalet_Id = Chalet_Id || property.Chalet_Id;
  
    
      await property.save();
  
    
      res.status(200).json({
        message: 'Property updated successfully',
        property,
      });
    } catch (error) {
      console.error('Error updating Property:', error);
      res.status(500).json({ error: 'Failed to update Property' });
    }
  };
  
  

 exports.deleteChaletProp = async (req, res) => {
  const { id } = req.params;

  try {
 
    const property = await Chalets_Props.findByPk(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

  
    await property.destroy();

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};


