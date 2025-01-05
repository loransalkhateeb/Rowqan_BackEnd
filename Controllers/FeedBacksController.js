const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const FeedBack = require('../Models/FeedBackModel');
const Chalet = require('../Models/ChaletsModel');
const AvailableEvents = require('../Models/AvailableEvents');
const Lands = require('../Models/CategoriesLandsModel');
const {client} = require('../Utils/redisClient')


exports.createFeedBack = async (req, res) => {
  try {
    const { description, lang, rating, chalet_id, available_event_id, land_id } = req.body || {};

    if (!rating) {
      return res.status(400).json(ErrorResponse('Validation failed', ['Rating is required']));
    }

    const validationErrors = validateInput({ description, lang, rating, chalet_id, available_event_id, land_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
    }

    let chalet = null;
    if (chalet_id) {
      chalet = await Chalet.findByPk(chalet_id);
      if (!chalet) {
        return res.status(404).json(ErrorResponse('Chalet not found.'));
      }
    }

    let availableEvent = null;
    if (available_event_id) {
      availableEvent = await AvailableEvents.findByPk(available_event_id);
      if (!availableEvent) {
        return res.status(404).json(ErrorResponse('Available Event not found.'));
      }
    }

    let land = null;
    if (land_id) {
      land = await Lands.findByPk(land_id);
      if (!land) {
        return res.status(404).json(ErrorResponse('Land not found.'));
      }
    }

    const newFeedBack = await FeedBack.create({
      description,
      lang,
      rating,
      chalet_id: chalet_id || null,
      available_event_id: available_event_id || null,
      land_id: land_id || null,
    });

   
    const cacheDeletePromises = [client.del(`feedback:page:1:limit:20`)];
    await Promise.all(cacheDeletePromises);

    
    await client.set(`feedback:${newFeedBack.id}`, JSON.stringify(newFeedBack), { EX: 3600 });

    res.status(201).json(
      newFeedBack,
    );
  } catch (error) {
    console.error("Error in createFeedBack:", error.message);
    res.status(500).json(
      ErrorResponse('Failed to create feedback', [
        'An internal server error occurred.',
      ])
    );
  }
};






exports.getFeedBackById = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    const cacheKey = `feedback:${id}:${lang}`;
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for feedback:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for feedback:", id);

   
    const feedback = await FeedBack.findOne({
      where: { id, lang },
      include: [
        { model: Chalet },
        { model: AvailableEvents },
        { model: Lands },
      ],
    });

    if (!feedback) {
      return res.status(404).json(ErrorResponse('Feedback not found.'));
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(feedback));

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};



exports.getFeedBackByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    const cacheKey = `feedbacks:chalet:${chalet_id}:${lang}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for feedbacks:", chalet_id);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for feedbacks:", chalet_id);

    
    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json(ErrorResponse('Chalet not found.'));
    }

    
    const feedbacks = await FeedBack.findAll({
      where: { 
        chalet_id,
        lang,
      },
      attributes: ['id', 'description','lang','rating'], 
    });

    if (feedbacks.length === 0) {
      return res.status(404).json(ErrorResponse('No feedback found for this chalet in the specified language.'));
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(feedbacks));

    return res.status(200).json({ feedbacks });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};

  




exports.getFeedBackByEventId = async (req, res) => {
  try {
    const { available_event_id, lang } = req.params;

    const cacheKey = `feedbacks:event:${available_event_id}:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for feedbacks:", available_event_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for feedbacks:", available_event_id);

   
    const event = await AvailableEvents.findByPk(available_event_id);
    if (!event) {
      return res.status(404).json(ErrorResponse('Event not found.'));
    }

  
    const feedbacks = await FeedBack.findAll({
      where: { 
        available_event_id,
        lang,
      },
      attributes: ['id', 'description','lang','rating'], 
    });

    if (feedbacks.length === 0) {
      return res.status(404).json(ErrorResponse('No feedback found for this event in the specified language.'));
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(feedbacks));

    return res.status(200).json({ feedbacks });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};



exports.getFeedBackByLandId = async (req, res) => {
  try {
    const { land_id, lang } = req.params;

    const cacheKey = `feedbacks:land:${land_id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for feedbacks:", land_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for feedbacks:", land_id);

   
    const land = await Lands.findByPk(land_id);
    if (!land) {
      return res.status(404).json(ErrorResponse('Land not found.'));
    }

    
    const feedbacks = await FeedBack.findAll({
      where: { 
        land_id,
        lang,
      },
      attributes: ['id', 'description','lang','rating']
    });

    if (feedbacks.length === 0) {
      return res.status(404).json(ErrorResponse('No feedback found for this land in the specified language.'));
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(feedbacks));

    return res.status(200).json({ feedbacks });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};











exports.updateFeedBack = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, action, lang, status } = req.body;
    const image = req.file?.filename || null;

    
    const validationErrors = validateInput({ title, description, action, lang, status });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse("Validation failed", validationErrors));
    }

   
    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

   
    const feedback = await FeedBack.findByPk(id);
    if (!feedback) {
      return res.status(404).json(ErrorResponse('Feedback not found'));
    }

    
    const updatedFields = {};
    if (title && title !== feedback.title) updatedFields.title = title;
    if (description && description !== feedback.description) updatedFields.description = description;
    if (action && action !== feedback.action) updatedFields.action = action;
    if (lang && lang !== feedback.lang) updatedFields.lang = lang;
    if (status && status !== feedback.status) updatedFields.status = status;
    if (image && image !== feedback.image) updatedFields.image = image;

   
    if (Object.keys(updatedFields).length > 0) {
      await feedback.update(updatedFields);
    }

    
    const updatedData = feedback.toJSON();
    const cacheKey = `feedback:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    return res.status(200).json(
      updatedData,
    );
  } catch (error) {
    console.error("Error in updateFeedBack:", error);
    return res.status(500).json(
      ErrorResponse("Failed to update Feedback", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};





exports.deleteFeedBack = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const [feedback, _] = await Promise.all([
      FeedBack.findOne({
        where: {
          id,
          lang, 
        }
      }),
      client.del(`feedback:${id}`), 
    ]);

    if (!feedback) {
      return res.status(404).json(
        ErrorResponse("Feedback not found", [
          "No Feedback entry found with the given ID and language.",
        ])
      );
    }

    await feedback.destroy();

    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFeedBack:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Feedback entry", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};
