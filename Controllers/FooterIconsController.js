const FooterIcons = require('../Models/FooterIcons');
const Footer = require('../Models/FooterModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')

exports.createFooterIcon = async (req, res) => {
  try {
    const { footer_id, link_to } = req.body;
    const icon = req.file ? req.file.filename : null;

    if (!footer_id || !link_to) {
      return res
        .status(400)
        .json(ErrorResponse("Footer ID and link are required."));
    }

    const [newIcon, created] = await FooterIcons.findOrCreate({
      where: { footer_id, link_to },
      defaults: { footer_id, link_to, icon },
    });

    if (!created) {
      return res
        .status(400)
        .json(ErrorResponse("Footer Icon with the same footer_id and link already exists"));
    }

    res.status(201).json(
     newIcon,
    );
  } catch (error) {
    console.error('Error creating Footer Icon:', error);
    res.status(500).json(ErrorResponse('Failed to create Footer Icon'));
  }
};



exports.getAllFooterIcons = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

   
    const cacheKey = `footerIcons:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    const footerIcons = await FooterIcons.findAll({
      include: [{ model: Footer, attributes: ['title', 'lang'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']], 
    });

    if (footerIcons.length === 0) {
      return res.status(404).json(ErrorResponse('No footer icons found'));
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(footerIcons));

    res.status(200).json(
    footerIcons,
    );
  } catch (error) {
    console.error("Error fetching footer icons:", error);
    res.status(500).json(ErrorResponse('Failed to fetch footer icons'));
  }
};


exports.getFooterIconById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `footerIcon:${id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for footer icon:", id);
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for footer icon:", id);

   
    const icon = await FooterIcons.findByPk(id, {
      include: [{ model: Footer, attributes: ['title', 'lang'] }],
    });

   
    if (!icon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(icon));

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

    const validationErrors = validateInput({ footer_id, link_to });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }
   
    const footerIcon = await FooterIcons.findByPk(id);
    if (!footerIcon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }
   
    const updatedFields = {};
    if (footer_id && footer_id !== footerIcon.footer_id) updatedFields.footer_id = footer_id;
    if (link_to && link_to !== footerIcon.link_to) updatedFields.link_to = link_to;
    if (icon && icon !== footerIcon.icon) updatedFields.icon = icon;

    if (Object.keys(updatedFields).length > 0) {
      await footerIcon.update(updatedFields);
    }

    const updatedData = footerIcon.toJSON();

    res.status(200).json(
      updatedData,
    );
  } catch (error) {
    console.error('Error updating footer icon:', error);
    res.status(500).json(ErrorResponse('Failed to update footer icon'));
  }
};




exports.deleteFooterIcon = async (req, res) => {
  try {
    const { id } = req.params;

    const [footerIcon, _] = await Promise.all([
      FooterIcons.findByPk(id),
      client.del(`footerIcon:${id}`), 
    ]);

    if (!footerIcon) {
      return res.status(404).json(ErrorResponse('Footer Icon not found'));
    }

    await footerIcon.destroy();

    res.status(200).json({ message: 'Footer Icon deleted successfully' });
  } catch (error) {
    console.error('Error deleting footer icon:', error);
    res.status(500).json(ErrorResponse('Failed to delete footer icon'));
  }
};

