const Header = require('../Models/HeaderModel');  



exports.createHeader = async (req, res) => {
    try {
      const { header_name, url, lang } = req.body;
   
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const newheader = await Header.create({
        header_name,
        url,
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
    const headers = await Header.findAll({
      where: { lang },
    });

    res.status(200).json({ headers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve headers' });
  }
};


exports.getHeaderById = async (req, res) => {
  try {
    const { id, lang } = req.params; 
    const header = await Header.findOne({
      where: { id, lang },  
    });

    if (!header) {
      return res.status(404).json({ error: 'Header not found' });
    }

    res.status(200).json({ header });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve header' });
  }
};

exports.updateHeader = async (req, res) => {
    try {
      const { id } = req.params;
      const { header_name, url, lang } = req.body;
  
      const header = await Header.findOne({
        where: { id }
      });
  
      if (!header) {
        return res.status(404).json({ error: 'Header not found' });
      }
  
   
      header.header_name = header_name || header.header_name;  
      header.url = url || header.url;  
      header.lang = lang || header.lang; 

      await header.save();
  
      res.status(200).json({ message: 'Header updated successfully', header });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update header' });
    }
  };
  
  
  

exports.deleteHeader = async (req, res) => {
  try {
    const { id, lang } = req.params; 
    const header = await Header.findOne({
      where: { id, lang }, 
    });

    if (!header) {
      return res.status(404).json({ error: 'Header not found' });
    }

    await header.destroy();

    res.status(200).json({ message: 'Header deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete header' });
  }
};
