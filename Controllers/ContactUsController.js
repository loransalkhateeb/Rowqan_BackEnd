const ContactUs = require('../Models/ContactUsModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');


exports.createContactUs = async (req, res) => {
  try {
    const { title, action, lang } = req.body;
    const image = req.file ? req.file.filename : null;

 
    const validationErrors = validateInput({ title, action, lang, image }, ['title', 'action', 'lang', 'image']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const newContactUs = await ContactUs.create({
      image,
      title,
      action,
      lang,
    });

    res.status(201).json({
      message: 'ContactUs created successfully',
      contactUs: newContactUs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to create ContactUs'));
  }
};


exports.updateContactUs = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, action, lang } = req.body;
    const image = req.file ? req.file.filename : null;

  
    const validationErrors = validateInput({ title, action, lang }, ['title', 'action', 'lang']);
    if (validationErrors) {
      return res.status(400).json(ErrorResponse(validationErrors));
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const contactUs = await ContactUs.findByPk(id);
    if (!contactUs) {
      return res.status(404).json(ErrorResponse('ContactUs not found'));
    }

    if (image) {
      contactUs.image = image;
    }

    contactUs.title = title;
    contactUs.action = action;
    contactUs.lang = lang;

    await contactUs.save();

    res.status(200).json({
      message: 'ContactUs updated successfully',
      contactUs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to update ContactUs'));
  }
};


exports.getContactUsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const contactUs = await ContactUs.findAll({
      where: {
        lang,
        id,
      },
    });

    if (contactUs.length === 0) {
      return res.status(404).json(ErrorResponse('No ContactUs found for the specified language'));
    }

    res.status(200).json({
      message: 'ContactUs retrieved successfully',
      contactUs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to retrieve ContactUs'));
  }
};


exports.getALLContactUs = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const contactUs = await ContactUs.findAll({
      where: {
        lang,
      },
    });

    if (contactUs.length === 0) {
      return res.status(404).json(ErrorResponse('No ContactUs found for the specified language'));
    }

    res.status(200).json({
      message: 'ContactUs retrieved successfully',
      contactUs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to retrieve ContactUs'));
  }
};


exports.deleteContactUs = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(ErrorResponse('Invalid language, must be "en" or "ar"'));
    }

    const contactUs = await ContactUs.findOne({
      where: {
        id,
        lang,
      },
    });

    if (!contactUs) {
      return res.status(404).json(ErrorResponse('ContactUs not found for the specified language'));
    }

    await contactUs.destroy();

    res.status(200).json({
      message: 'ContactUs deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(ErrorResponse('Failed to delete ContactUs'));
  }
};
