const Header = require('../Models/HeaderModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');


exports.createHeader = async (req, res) => {
    try {
      const { header_name, lang } = req.body;
   
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const newheader = await Header.create({
        header_name,
        lang,
      });
  
      res.status(201).json({ message: 'Header created successfully', header: newheader });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create Header' });
    }
  };
  

exports.getAllHeaders = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!lang) {
      return res.status(400).json(ErrorResponse('Language parameter is required'));
    }

    const headers = await Header.findAll({
      where: { lang },
    });

    if (headers.length === 0) {
      return res.status(404).json(ErrorResponse('No headers found for the specified language'));
    }

    res.status(200).json({ headers });
  } catch (error) {
    console.error('Error retrieving headers:', error);
    res.status(500).json(ErrorResponse('Failed to retrieve headers'));
  }
};


exports.getHeaderById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!id || !lang) {
      return res.status(400).json(ErrorResponse('ID and language are required'));
    }

    const header = await Header.findOne({
      where: { id, lang },
    });

    if (!header) {
      return res.status(404).json(ErrorResponse('Header not found'));
    }

    res.status(200).json({ header });
  } catch (error) {
    console.error('Error retrieving header:', error);
    res.status(500).json(ErrorResponse('Failed to retrieve header'));
  }
};

exports.updateHeader = async (req, res) => {
    try {
      const { id } = req.params;
      const { header_name, lang } = req.body;
  
      const header = await Header.findOne({
        where: { id }
      });
  
      if (!header) {
        return res.status(404).json({ error: 'Header not found' });
      }
  
   
      header.header_name = header_name || header.header_name;  
      header.lang = lang || header.lang; 

    await header.save();

    res.status(200).json({ message: 'Header updated successfully', header });
  } catch (error) {
    console.error('Error updating header:', error);
    res.status(500).json(ErrorResponse('Failed to update header'));
  }
};


exports.deleteHeader = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!id || !lang) {
      return res.status(400).json(ErrorResponse('ID and language are required'));
    }

    const header = await Header.findOne({
      where: { id, lang },
    });

    if (!header) {
      return res.status(404).json(ErrorResponse('Header not found'));
    }

    await header.destroy();

    res.status(200).json({ message: 'Header deleted successfully' });
  } catch (error) {
    console.error('Error deleting header:', error);
    res.status(500).json(ErrorResponse('Failed to delete header'));
  }
};
