
const FooterIcons = require('../Models/FooterIcons');

exports.createFooterIcon = async (req, res) => {
    try {
      const { footer_id } = req.body;
      let icon = null;
  
    
      if (req.file) {
        icon = req.file.filename;
      }
  
      if (!footer_id || !icon) {
        return res.status(400).json({ error: 'Footer ID and icon image are required' });
      }
  
      const newIcon = await FooterIcons.create({
        footer_id,  
        icon: icon,
      });
  
      res.status(201).json({
        message: 'Footer Icon created successfully',
        footerIcon: newIcon, 
      });
    } catch (error) {
      console.error('Error creating Footer Icon:', error);
      res.status(500).json({ error: 'Failed to create Footer Icon' });
    }
  };
  
  




exports.getAllFooterIcons = async (req, res) => {
  try {
    const icons = await FooterIcons.findAll({
      include: [{ model: Footer, attributes: ['title', 'lang'] }], 
    });

    res.status(200).json({ icons });
  } catch (error) {
    console.error('Error fetching footer icons:', error);
    res.status(500).json({ error: 'Failed to fetch footer icons' });
  }
};


exports.getFooterIconById = async (req, res) => {
  try {
    const { id } = req.params;

    const icon = await FooterIcons.findByPk(id, { 
    });

    if (!icon) {
      return res.status(404).json({ error: 'Footer Icon not found' });
    }

    res.status(200).json({ icon });
  } catch (error) {
    console.error('Error fetching footer icon:', error);
    res.status(500).json({ error: 'Failed to fetch footer icon' });
  }
};

exports.updateFooterIcon = async (req, res) => {
    try {
      const { id } = req.params;
      const { id_footer } = req.body;
      const icon = req.file ? req.file.filename : null;
  
      const footerIcon = await FooterIcons.findByPk(id);
  
      if (!footerIcon) {
        return res.status(404).json({ error: 'Footer icon not found' });
      }
  
      footerIcon.id_footer = id_footer || footerIcon.id_footer;
      footerIcon.icon = icon || footerIcon.icon;
  
      await footerIcon.save();
  
      res.status(200).json({
        message: 'Footer icon updated successfully',
        footerIcon,
      });
    } catch (error) {
      console.error('Error updating footer icon:', error);
      res.status(500).json({ error: 'Failed to update footer icon' });
    }
  };
  


exports.deleteFooterIcon = async (req, res) => {
  try {
    const { id } = req.params;

    const existingIcon = await FooterIcons.findByPk(id);

    if (!existingIcon) {
      return res.status(404).json({ error: 'Footer Icon not found' });
    }

    await existingIcon.destroy();

    res.status(200).json({ message: 'Footer Icon deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer icon:', error);
    res.status(500).json({ error: 'Failed to delete footer icon' });
  }
};
