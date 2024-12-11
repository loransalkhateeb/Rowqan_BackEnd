const FooterIcons = require('../Models/FooterIcons');
const Footer = require('../Models/FooterModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');


exports.createFooterIcon = async (req, res) => {
  try {
    const { footer_id, link_to } = req.body;
    const icon = req.file ? req.file.filename : null;

 
    const validationErrors = validateInput({ footer_id, link_to, icon }, ['footer_id', 'link_to', 'icon']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const newIcon = await FooterIcons.create({
      footer_id,
      icon,
      link_to,
    });

    res.status(201).json({
      message: 'Footer Icon created successfully',
      footerIcon: newIcon,
    });
  } catch (error) {
    console.error('Error creating Footer Icon:', error);
    res.status(500).json(ErrorResponse('Failed to create Footer Icon'));
  }
};


exports.getAllFooterIcons = async (req, res) => {
  try {
    const icons = await FooterIcons.findAll({
      include: [{ model: Footer, attributes: ['title', 'lang'] }],
    });

    if (icons.length === 0) {
      return res.status(404).json(ErrorResponse('No footer icons found'));
    }

    res.status(200).json({ icons });
  } catch (error) {
    console.error('Error fetching footer icons:', error);
    res.status(500).json(ErrorResponse('Failed to fetch footer icons'));
  }
};


exports.getFooterIconById = async (req, res) => {
  try {
    const { id } = req.params;

    const icon = await FooterIcons.findByPk(id, {
      include: [{ model: Footer, attributes: ['title', 'lang'] }],
    });

    if (!icon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }

    res.status(200).json({ icon });
  } catch (error) {
    console.error('Error fetching footer icon:', error);
    res.status(500).json(ErrorResponse('Failed to fetch footer icon'));
  }
};


exports.updateFooterIcon = async (req, res) => {
  try {
    const { id } = req.params;
    const { footer_id, link_to } = req.body;
    const icon = req.file ? req.file.filename : null;

    
    const validationErrors = validateInput({ footer_id, link_to }, []);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    const footerIcon = await FooterIcons.findByPk(id);

    if (!footerIcon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }

    footerIcon.footer_id = footer_id || footerIcon.footer_id;
    footerIcon.link_to = link_to || footerIcon.link_to;
    footerIcon.icon = icon || footerIcon.icon;

    await footerIcon.save();

    res.status(200).json({
      message: 'Footer Icon updated successfully',
      footerIcon,
    });
  } catch (error) {
    console.error('Error updating footer icon:', error);
    res.status(500).json(ErrorResponse('Failed to update footer icon'));
  }
};


exports.deleteFooterIcon = async (req, res) => {
  try {
    const { id } = req.params;

    const existingIcon = await FooterIcons.findByPk(id);

    if (!existingIcon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }

    await existingIcon.destroy();

    res.status(200).json({ message: 'Footer Icon deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer icon:', error);
    res.status(500).json(ErrorResponse('Failed to delete footer icon'));
  }
};
