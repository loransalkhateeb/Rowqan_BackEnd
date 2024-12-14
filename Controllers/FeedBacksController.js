const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const FeedBack = require('../Models/FeedBackModel');
const Chalet = require('../Models/ChaletsModel');
const AvailableEvents = require('../Models/AvailableEvents');
const Lands = require('../Models/CategoriesLandsModel');

exports.createFeedBack = async (req, res) => {
    try {
        const { description, lang, rating, chalet_id, available_event_id, land_id } = req.body;

       
        const validationErrors = validateInput({ description, lang, rating, chalet_id, available_event_id, land_id });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

       
        if (!rating) {
            return res.status(400).json(ErrorResponse('Rating is required.'));
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

        return res.status(201).json({
            message: 'Feedback created successfully',
            feedback: newFeedBack
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};





exports.getFeedBackById = async (req, res) => {
  try {
    const { id, lang } = req.params;

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

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};



exports.getFeedBackByChaletId = async (req, res) => {
    try {
      const { chalet_id, lang } = req.params;
      const chalet = await Chalet.findByPk(chalet_id);
      if (!chalet) {
        return res.status(404).json(ErrorResponse('Chalet not found.'));
      }
  
      const feedbacks = await FeedBack.findAll({
        where: { 
          chalet_id,
          lang
        },
      });
  
      if (feedbacks.length === 0) {
        return res.status(404).json(ErrorResponse('No feedback found for this chalet in the specified language.'));
      }
  
      return res.status(200).json({ feedbacks });
    } catch (error) {
      console.error(error);
      return res.status(500).json(ErrorResponse('Internal server error'));
    }
  };
  




  exports.getFeedBackByEventId = async (req, res) => {
    try {
      const { available_event_id, lang } = req.params;
      const events = await AvailableEvents.findByPk(available_event_id);
      if (!events) {
        return res.status(404).json(ErrorResponse('events not found.'));
      }
  
      const feedbacks = await FeedBack.findAll({
        where: { 
          available_event_id,
          lang
        },
      });
  
      if (feedbacks.length === 0) {
        return res.status(404).json(ErrorResponse('No feedback found for this Event in the specified language.'));
      }
  
      return res.status(200).json({ feedbacks });
    } catch (error) {
      console.error(error);
      return res.status(500).json(ErrorResponse('Internal server error'));
    }
  };



  exports.getFeedBackByLandId = async (req, res) => {
    try {
      const {  land_id, lang } = req.params;
      const land = await Lands.findByPk(land_id);
      if (!land) {
        return res.status(404).json(ErrorResponse('Land not found.'));
      }
  
      const feedbacks = await FeedBack.findAll({
        where: { 
          land_id,
          lang
        },
      });
  
      if (feedbacks.length === 0) {
        return res.status(404).json(ErrorResponse('No feedback found for this land in the specified language.'));
      }
  
      return res.status(200).json({ feedbacks });
    } catch (error) {
      console.error(error);
      return res.status(500).json(ErrorResponse('Internal server error'));
    }
  };








  exports.updateFeedBack = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, lang, rating, chalet_id, available_event_id, land_id } = req.body;

        
        const { error } = validateInput({ description, lang });
        if (error) {
            return res.status(400).json(ErrorResponse(error.details[0].message));
        }

        const feedback = await FeedBack.findByPk(id);
        if (!feedback) {
            return res.status(404).json(ErrorResponse('Feedback not found.'));
        }

      
        feedback.description = description || feedback.description;
        feedback.lang = lang || feedback.lang;
        feedback.rating = rating || feedback.rating;
        feedback.chalet_id = chalet_id !== undefined ? chalet_id : feedback.chalet_id;
        feedback.available_event_id = available_event_id !== undefined ? available_event_id : feedback.available_event_id;
        feedback.land_id = land_id !== undefined ? land_id : feedback.land_id;

        await feedback.save();

        return res.status(200).json({
            message: 'Feedback updated successfully',
            feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};


exports.deleteFeedBack = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const feedback = await FeedBack.findOne({ where: { id, lang } });
    if (!feedback) {
      return res.status(404).json(ErrorResponse('Feedback not found.'));
    }

    await feedback.destroy();
    return res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json(ErrorResponse('Internal server error'));
  }
};
