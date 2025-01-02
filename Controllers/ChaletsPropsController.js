const Chalets_Props = require('../Models/ChaletsProps');
const Chalets = require('../Models/ChaletsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput'); 
const{client} = require('../Utils/redisClient')

exports.createChaletProp = async (req, res) => {
  try {
    const { Chalet_Id, title, lang } = req.body || {};

    
    if (!Chalet_Id || !title || !lang) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Chalet_Id, title, and lang are required",
        ])
      );
    }

  
    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(
        ErrorResponse('Invalid or missing language, it should be "en" or "ar"')
      );
    }

    
    const chalet = await Chalets.findByPk(Chalet_Id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found'));
    }

    
    const image = req.file ? req.file.path : null;

    
    const newChaletProp = await Chalets_Props.create({
      Chalet_Id,
      title,
      lang,
      image,
    });

   
    const cacheDeletePromises = [client.del(`chaletProps:${Chalet_Id}:page:1:limit:20`)];
    await Promise.all(cacheDeletePromises);

   
    await client.set(`chaletProp:${newChaletProp.id}`, JSON.stringify(newChaletProp), {
      EX: 3600, 
    });

  
    res.status(201).json(
    newChaletProp,
    );
  } catch (error) {
    console.error('Error in createChaletProp:', error);
    res.status(500).json(ErrorResponse('Error creating property'));
  }
};




exports.getAllChaletProps = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `chaletProps:lang:${lang}:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }

    const whereClause = lang ? { lang } : {};
    const properties = await Chalets_Props.findAll({
      where: whereClause,
      order: [["id", "DESC"]], 
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ["id", "title", "image", "lang"],
    });

   
    await client.setEx(cacheKey, 3600, JSON.stringify(properties));

    res.status(200).json(
    properties,
    );
  } catch (error) {
    console.error("Error in getAllChaletProps:", error.message);
    res.status(500).json(ErrorResponse("Failed to fetch Chalet properties", [
      "An internal server error occurred.",
    ]));
  }
};






exports.getAllChaletPropsByChaletId = async (req, res) => {
  try {
    const { Chalet_Id, lang } = req.params;

    if (!Chalet_Id || isNaN(Chalet_Id)) {
      return res.status(400).json({
        error: "Invalid 'Chalet_Id'. It must be a valid numeric ID.",
      });
    }


    const validLangs = ['ar', 'en'];
    if (lang && !validLangs.includes(lang)) {
      return res.status(400).json({
        error: `Invalid 'lang'. Supported values are ${validLangs.join(", ")}.`,
      });
    }


    const cacheKey = `chaletProps:${Chalet_Id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {

      return res.status(200).json(JSON.parse(cachedData));
    }

    const properties = await Chalets_Props.findAll({
      where: { Chalet_Id },
      order: [["id", "DESC"]],
      attributes: ["id", "image", "title", "lang", "Chalet_Id"],
      include: [
        {
          model: Chalets,
          attributes: ['id', 'title', 'lang']
        }
      ]
    });


    if (properties.length === 0) {
      return res.status(404).json({
        error: "No Chalet properties found for the given Chalet_Id.",
      });
    }

 
    await client.setEx(cacheKey, 3600, JSON.stringify(properties));

 
    return res.status(200).json(properties);

  } catch (error) {
    console.error("Error in getAllChaletPropsByChaletId:", error.message);

    return res.status(500).json({
      error: "Failed to fetch Chalet properties",
      details: ["An internal server error occurred. Please try again later."]
    });
  }
};





exports.getChaletPropById = async (req, res) => {
  const { id, lang } = req.params;

  try {
    if (lang && !['en', 'ar'].includes(lang)) {
      return res.status(400).json(
        ErrorResponse('Invalid language parameter. Language must be "en" or "ar".')
      );
    }

    
    const cacheKey = `chaletProp:${id}:${lang || 'all'}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for chalet prop:", id, lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for chalet prop:", id, lang);

    
    const property = await Chalets_Props.findOne({
      where: { id },
      include: [
        {
          model: Chalets,
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!property) {
      return res.status(404).json(ErrorResponse('Property not found'));
    }

    
    if (lang && property.lang !== lang) {
      return res.status(400).json(
        ErrorResponse('Language does not match the record.')
      );
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(property));

    res.status(200).json(
     property,
    );
  } catch (error) {
    console.error("Error in getChaletPropById:", error);
    res.status(500).json(ErrorResponse('Error fetching property'));
  }
};



exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, Chalet_Id, lang } = req.body;
    const image = req.file?.filename || null;

    console.log("Request Body:", req.body);
    console.log("File:", req.file);

    const validationErrors = validateInput({ title, Chalet_Id, lang });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

    if (lang && !['en', 'ar'].includes(lang)) {
      return res
        .status(400)
        .json(ErrorResponse("Invalid language. Allowed values are 'en' or 'ar'"));
    }

    const property = await Chalets_Props.findByPk(id);
    if (!property) {
      return res
        .status(404)
        .json(ErrorResponse("Property not found", ["No property found with the given ID."]));
    }

    console.log("Before Update:", property.toJSON());

    const chalet = await Chalets.findByPk(Chalet_Id);
    if (!chalet && Chalet_Id) {
      return res
        .status(404)
        .json(ErrorResponse("Chalet not found", ["No chalet found with the given ID."]));
    }

    const updatedFields = {};
    if (title && title !== property.title) updatedFields.title = title;
    if (lang && lang !== property.lang) updatedFields.lang = lang;
    if (Chalet_Id && Chalet_Id !== property.Chalet_Id) updatedFields.Chalet_Id = Chalet_Id;
    if (image) updatedFields.image = image;

    console.log("Fields to update:", updatedFields);

    if (Object.keys(updatedFields).length > 0) {
      await property.update(updatedFields);
      console.log("Updated in DB:", await property.reload());
    }

    const cacheKey = `property:${id}`;
    await client.del(cacheKey);

    const updatedData = await property.reload();
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    return res.status(200).json(
      updatedData,
    );
  } catch (error) {
    console.error("Error in updateProperty:", error);

    return res.status(500).json(
      ErrorResponse("Failed to update Property", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};






exports.deleteChaletProp = async (req, res) => {
  try {
    const { id,lang } = req.params;
    
    if (!lang || !['en', 'ar'].includes(lang)) {
      return res.status(400).json(
        ErrorResponse("Invalid or missing language", [
          "The language field is required and must be 'en' or 'ar'.",
        ])
      );
    }

    
    const [property, _] = await Promise.all([
      Chalets_Props.findByPk(id),
      client.del(`chaletProp:${id}`), 
    ]);

    if (!property) {
      return res.status(404).json(
        ErrorResponse("Property not found", [
          "No property found with the given ID.",
        ])
      );
    }

    
    if (property.lang !== lang) {
      return res.status(400).json(
        ErrorResponse("Language mismatch", [
          `The language for this property is '${property.lang}', not '${lang}'.`,
        ])
      );
    }

  
    await property.destroy();

    return res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error in deleteChaletProp:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete property", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};

