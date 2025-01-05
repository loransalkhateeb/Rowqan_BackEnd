const BreifDetailsChalets = require('../Models/BreifDetailsChalets');
const Chalet = require('../Models/ChaletsModel');
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const {client} = require('../Utils/redisClient')


exports.createBreifDetailsChalet = async (req, res) => {
  try {
    const { type, value, lang, chalet_id } = req.body;

    if (!type || !value || !lang || !chalet_id) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Type, value, lang, and chalet_id are required",
        ])
      );
    }


    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json( ErrorResponse('Invalid language'));
    }

    
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json( ErrorResponse('Chalet not found'));
    }

    
    const existingBreifDetailsChalet = await BreifDetailsChalets.findOne({
      where: { chalet_id, lang, type }
    });
    if (existingBreifDetailsChalet) {
      return res.status(400).json( ErrorResponse('BreifDetailsChalet with the same type, lang, and chalet_id already exists'));
    }

    
    const newBreifDetailsChalet = await BreifDetailsChalets.create({
      type,
      value,
      lang,
      chalet_id,
    });

    
    const cacheDeletePromises = [client.del(`chalet:${chalet_id}:breifDetails`)];

    await Promise.all(cacheDeletePromises);

    
    res.status(201).json(newBreifDetailsChalet,);
  } catch (error) {
    console.error("Error in createBreifDetailsChalet:", error.message);
    res.status(500).json(
       ErrorResponse("Failed to create BreifDetailsChalet", [
        "An internal server error occurred.",
      ])
    );
  }
};


exports.getBreifDetailsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const cacheKey = `chalet:${chalet_id}:breifDetails:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for BreifDetails:", chalet_id);
      return res.status(200).json(JSON.parse(cachedData),);
    }
    console.log("Cache miss for BreifDetails:", chalet_id);

  
    const chalet = await Chalet.findOne({
      where: { id: chalet_id },
      attributes: ['id', 'title'], 
      include: {
        model: BreifDetailsChalets,
        where: { lang },
        required: false,
        attributes: ['id', 'type', 'value'],
      },
    });

    if (!chalet) {
      return res.status(404).json( ErrorResponse('Chalet not found'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(chalet.BreifDetailsChalets));

    return res.status(200).json(chalet.BreifDetailsChalets);
  } catch (error) {
    console.error("Error in getBreifDetailsByChaletId:", error);
    return res.status(500).json(
       ErrorResponse('Failed to retrieve BreifDetailsChalets', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};



exports.getBreifDetailsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const cacheKey = `breifDetails:${id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for BreifDetailsChalet:", id);
      return res.status(200).json(JSON.parse(cachedData),
    );
    }
    console.log("Cache miss for BreifDetailsChalet:", id);

   
    const breifDetailsChalet = await BreifDetailsChalets.findOne({
      attributes: ['id', 'type', 'value'], 
      where: { id, lang },
    });

    if (!breifDetailsChalet) {
      return res.status(404).json(new ErrorResponse('BreifDetailsChalet not found'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(breifDetailsChalet));

    return res.status(200).json(
      breifDetailsChalet,
    );
  } catch (error) {
    console.error("Error in getBreifDetailsById:", error);
    return res.status(500).json(
      new ErrorResponse('Failed to retrieve BreifDetailsChalet', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};


exports.updateBreifDetailsChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, lang, chalet_id } = req.body;

    const validationErrors = validateInput({ type, value, lang, chalet_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const breifDetailsChalet = await BreifDetailsChalets.findByPk(id);
    if (!breifDetailsChalet) {
      return res.status(404).json(new ErrorResponse('BreifDetailsChalet not found'));
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(new ErrorResponse('Chalet not found'));
    }

    const updatedFields = {};
    if (type && type !== breifDetailsChalet.type) updatedFields.type = type;
    if (value && value !== breifDetailsChalet.value) updatedFields.value = value;
    if (lang && lang !== breifDetailsChalet.lang) updatedFields.lang = lang;
    if (chalet_id && chalet_id !== breifDetailsChalet.chalet_id) updatedFields.chalet_id = chalet_id;

    if (Object.keys(updatedFields).length > 0) {
      await breifDetailsChalet.update(updatedFields);
    }

   
    const updatedData = breifDetailsChalet.toJSON();
    const cacheKey = `breifDetails:${id}:${lang}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    return res.status(200).json(updatedData,
    );
  } catch (error) {
    console.error("Error in updateBreifDetailsChalet:", error);

    return res.status(500).json(
      new ErrorResponse('Failed to update BreifDetailsChalet', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};




exports.deleteBreifDetailsChalet = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json( ErrorResponse('Invalid language'));
    }

    const [breifDetailsChalet, _] = await Promise.all([
      BreifDetailsChalets.findOne({ where: { id, lang } }),
      client.del(`breifDetailsChalet:${id}:${lang}`),
    ]);

    if (!breifDetailsChalet) {
      return res.status(404).json( ErrorResponse('BreifDetailsChalet not found'));
    }

    await breifDetailsChalet.destroy();

    return res.status(200).json({
      message: 'BreifDetailsChalet deleted successfully',
    });
  } catch (error) {
    console.error("Error in deleteBreifDetailsChalet:", error);

    return res.status(500).json(
       ErrorResponse('Failed to delete BreifDetailsChalet', [
        'An internal server error occurred. Please try again later.',
      ])
    );
  }
};

