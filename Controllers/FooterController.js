const Footer = require('../Models/FooterModel');


exports.createFooter = async (req, res) => {
  try {
    const { title, lang } = req.body;

 
    if (!title || !lang) {
      return res.status(400).json({ error: 'Title and language are required' });
    }

  
    const existingFooter = await Footer.findOne({ where: { title, lang } });
    if (existingFooter) {
      return res.status(400).json({ error: 'Footer with the same title and language already exists' });
    }

 
    const newFooter = await Footer.create({ title, lang });

    res.status(201).json({
      message: 'Footer created successfully',
      footer: newFooter,
    });
  } catch (error) {
    console.error('Error creating footer:', error);
    res.status(500).json({ error: 'Failed to create footer' });
  }
};


exports.getAllFooters = async (req, res) => {
  try {
    const { lang } = req.params;


    if (!lang) {
      return res.status(400).json({ error: 'Language is required' });
    }

   
    const footers = await Footer.findAll({ where: { lang } });

    res.status(200).json({ footers });
  } catch (error) {
    console.error('Error fetching footers:', error);
    res.status(500).json({ error: 'Failed to fetch footers' });
  }
};


exports.getFooterById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const footer = await Footer.findOne({ where: { id, lang } });

    if (!footer) {
      return res.status(404).json({ error: 'Footer not found' });
    }

    res.status(200).json({ footer });
  } catch (error) {
    console.error('Error fetching footer:', error);
    res.status(500).json({ error: 'Failed to fetch footer' });
  }
};


exports.updateFooter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title,lang } = req.body;

    const footer = await Footer.findOne({ where: { id } });

    if (!footer) {
      return res.status(404).json({ error: 'Footer not found' });
    }

    footer.title = title || footer.title;
    footer.lang = lang || footer.lang;

    await footer.save();

    res.status(200).json({ message: 'Footer updated successfully', footer });
  } catch (error) {
    console.error('Error updating footer:', error);
    res.status(500).json({ error: 'Failed to update footer' });
  }
};


exports.deleteFooter = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const footer = await Footer.findOne({ where: { id, lang } });

    if (!footer) {
      return res.status(404).json({ error: 'Footer not found' });
    }

    await footer.destroy();

    res.status(200).json({ message: 'Footer deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer:', error);
    res.status(500).json({ error: 'Failed to delete footer' });
  }
};
