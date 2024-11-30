const ContactUs = require('../Models/ContactUsModel');  

exports.createContactUs = async (req, res) => {
    try {
      const { title, action, lang } = req.body;
      const image = req.file ? req.file.filename : null; 
  
      if (!image || !title || !action || !lang) {
        return res.status(400).json({ error: 'Image, title, action, and lang are required' });
      }
  
      if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const newContactUs = await ContactUs.create({
        image,
        title,
        action,
        lang,
      });
  
      res.status(201).json({
        message: 'ContactUs created successfully',
        contactUs: newContactUs,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create ContactUs' });
    }
  };
  

  exports.updateContactUs = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, action, lang } = req.body;
      const image = req.file ? req.file.filename : null;
  
      if (!title || !action || !lang) {
        return res.status(400).json({ error: 'Title, action, and lang are required' });
      }
  
      if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const contactUs = await ContactUs.findByPk(id);
      if (!contactUs) {
        return res.status(404).json({ error: 'ContactUs not found' });
      }
  

      if (image) {
        contactUs.image = image;
      }
  
      contactUs.title = title;
      contactUs.action = action;
      contactUs.lang = lang;
  
      await contactUs.save();
  
      res.status(200).json({
        message: 'ContactUs updated successfully',
        contactUs,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update ContactUs' });
    }
  };

  exports.getContactUsById = async (req, res) => {
    try {
      const { id,lang } = req.params;
  
      if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const contactUs = await ContactUs.findAll({
        where: {
          lang: lang,
          id: id
        },
      });
  
      if (contactUs.length === 0) {
        return res.status(404).json({ error: 'No ContactUs found for the specified language' });
      }
  
      res.status(200).json({
        message: 'ContactUs retrieved successfully',
        contactUs,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve ContactUs' });
    }
  };
  
  exports.deleteContactUs = async (req, res) => {
    try {
      const { id,lang } = req.params;
  
      if (!['en', 'ar'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
  
      const contactUs = await ContactUs.findOne({
        where: {
          id: id,
          lang: lang,  
        },
      });
  
      if (!contactUs) {
        return res.status(404).json({ error: 'ContactUs not found for the specified language' });
      }
  
      await contactUs.destroy();
  
      res.status(200).json({
        message: 'ContactUs deleted successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete ContactUs' });
    }
  };
  
