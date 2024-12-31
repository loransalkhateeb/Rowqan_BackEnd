const ChaletsHero = require('../Models/ChaletsHero');
const { validateInput, ErrorResponse } = require('../Utils/validateInput'); 
const {client} = require('../Utils/redisClient')

exports.createChaletsHero = async (req, res) => {
  try {
    const { category, lang } = req.body || {};

   
    if (!category || !lang) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Category and language are required",
        ])
      );
    }

    const image = req.file?.filename;

    if (!image) {
      return res.status(400).json(ErrorResponse('Image is required'));
    }

    
    const validationErrors = validateInput({ category, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const newChaletsHero = await ChaletsHero.create({
      image,
      category,
      lang,
    });

   
    const cacheKey = `chaletsHero:category:${category}:lang:${lang}`;
    await client.del(cacheKey); 

  
    await client.set(cacheKey, JSON.stringify(newChaletsHero), { EX: 3600 });

  
    res.status(201).json(
    newChaletsHero,
    );
  } catch (error) {
    console.error('Error creating Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to create Chalets Hero'));
  }
};


exports.updateChaletsHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, lang } = req.body;
    const image = req.file?.filename || null;

   
    const validationErrors = validateInput({ category, lang });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const chaletHero = await ChaletsHero.findByPk(id);
    if (!chaletHero) {
      return res
        .status(404)
        .json(
          ErrorResponse("Chalet Hero not found", [
            "No Chalet Hero entry found with the given ID.",
          ])
        );
    }

  
    const updatedFields = {};
    if (category && category !== chaletHero.category) updatedFields.category = category;
    if (lang && lang !== chaletHero.lang) updatedFields.lang = lang;
    if (image) updatedFields.image = image;

   
    if (Object.keys(updatedFields).length > 0) {
      await chaletHero.update(updatedFields);
    }

   
    const updatedData = chaletHero.toJSON();

    
    const cacheKey = `chaletsHero:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

   
    return res.status(200).json(
       updatedData,
    );
  } catch (error) {
    console.error("Error updating Chalets Hero:", error);

    return res.status(500).json(
      ErrorResponse("Failed to update Chalets Hero", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};



exports.getChaletsHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const cacheKey = `chaletsHero:${id}:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chaletsHero:", id, lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    console.log("Cache miss for chaletsHero:", id, lang);

    
    const chaletHero = await ChaletsHero.findOne({
      attributes: ["id", "category", "lang", "image"],
      where: { id, lang },
    });

    if (!chaletHero) {
      return res.status(404).json(ErrorResponse('Chalets Hero not found'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletHero));

    
    res.status(200).json({ chaletHero });
  } catch (error) {
    console.error('Error fetching Chalets Hero:', error);
    res.status(500).json(ErrorResponse('Failed to fetch Chalets Hero'));
  }
};




exports.getAllChaletsHero = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;  
    const offset = (page - 1) * limit;

    if (!lang) {
      return res.status(400).json(ErrorResponse('Language parameter is required'));
    }

   
    const cacheKey = `chaletsHero:lang:${lang}:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
    );
    }

    
    const chaletsHeroes = await ChaletsHero.findAll({
      attributes: ["id", "category", "lang", "image"],  
      where: { lang },
      order: [["id", "DESC"]],  
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (chaletsHeroes.length === 0) {
      return res.status(404).json(ErrorResponse('No Chalets Heroes found for the given language'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(chaletsHeroes));

    
    res.status(200).json(
      chaletsHeroes,
    );
  } catch (error) {
    console.error('Error fetching Chalets Heroes by language:', error);
    res.status(500).json(ErrorResponse('Failed to fetch Chalets Heroes'));
  }
};



exports.deleteChaletsHero = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `chaletsHero:${id}`;
    const [chaletHero, _] = await Promise.all([
      ChaletsHero.findByPk(id),
      client.del(cacheKey),  
    ]);

    if (!chaletHero) {
      return res.status(404).json(ErrorResponse('Chalets Hero not found'));
    }

    
    await chaletHero.destroy();

    
    return res.status(200).json({ message: 'Chalets Hero deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChaletsHero:', error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Chalets Hero", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

