const Logo  = require('../Models/LogoModel'); 
const {client} = require('../Utils/redisClient')

exports.createLogo = async (req, res) => {
  try {

    const imageUrl = req.file ? req.file.filename : null;

    const newLogo = await Logo.create({
      image: imageUrl,
    });

    // if (req.user.user_type_id !== 1) {
    //   return res.status(403).json({
    //     error: 'You are not authorized to update users',
    //   });
    // }

    res.status(201).json(  newLogo );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Logo' });
  }
};



exports.getAllLogos = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `logos:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
      JSON.parse(cachedData),
      );
    }

    const logos = await Logo.findAll({
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!logos.length) {
      return res.status(404).json({ message: "No logos found" });
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(logos));

    res.status(200).json(
       logos,
    );
  } catch (error) {
    console.error("Error in getAllLogos:", error.message);
    res.status(500).json({
      error: "Failed to fetch logos",
    });
  }
};



exports.getLogoById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `logo:${id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for logo:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
    );
    }
    console.log("Cache miss for logo:", id);

    
    const logo = await Logo.findOne({ where: { id } });

    if (!logo) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(logo));

    res.status(200).json(logo);
  } catch (error) {
    console.error("Error in getLogoById:", error);
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

      // if (req.user.user_type_id !== 1) {
      //   return res.status(403).json({
      //     error:'You are not authorized to update users',
      //   });
      // }
  
 
      logo.image = image || logo.image; 
  
  
      await logo.save();
      
      res.status(200).json( logo );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update logo' });
    }
  };
  
  


  exports.deleteLogo = async (req, res) => {
    try {
      const { id } = req.params;
  
      const [logo, _] = await Promise.all([
        Logo.findByPk(id),
        client.del(`logo:${id}`),
      ]);
  
      if (!logo) {
        return res.status(404).json({
          error: 'Logo not found',
        });
      }
  
      await logo.destroy();
  
      return res.status(200).json({ message: 'Logo deleted successfully' });
    } catch (error) {
      console.error("Error in deleteLogo:", error);
  
      return res.status(500).json({
        error: 'Failed to delete logo',
        message: 'An internal server error occurred. Please try again later.',
      });
    }
  };
  