const Logo  = require('../Models/LogoModel'); 


exports.createLogo = async (req, res) => {
  try {

    const imageUrl = req.file ? req.file.filename : null;

    const newLogo = await Logo.create({
      image: imageUrl,
    });

    if (req.user.user_type_id !== 1) {
      return res.status(403).json({
        error: 'You are not authorized to update users',
      });
    }

    res.status(201).json({ message: 'Logo created successfully', hero: newLogo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Logo' });
  }
};



exports.getAllLogos = async (req, res) => {
  try {
    const logos = await Logo.findAll();
    res.status(200).json(logos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch logos' });
  }
};


exports.getLogoById = async (req, res) => {
  try {
    const { id } = req.params;

    const logo = await Logo.findOne({ where: { id } });

    if (!logo) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    res.status(200).json(logo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
};


exports.updatelogo = async (req, res) => {
    try {
      const { id } = req.params;
      

      const image = req.file ? req.file.filename : null;  
  
      const logo = await Logo.findByPk(id);
      
      if (!logo) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      if (req.user.user_type_id !== 1) {
        return res.status(403).json({
          error:'You are not authorized to update users',
        });
      }
  
 
      logo.image = image || logo.image; 
  
  
      await logo.save();
      
      res.status(200).json({ message: 'Logo updated successfully', logo });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update logo' });
    }
  };
  
  


exports.deleteLogo = async (req, res) => {
  try {
    const { id } = req.params;

    const logo = await Logo.findOne({ where: { id } });

    if (!logo) {
      return res.status(404).json({ error: 'Logo not found' });
    }


    await logo.destroy();

    res.status(200).json({
      message: 'Logo deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
};