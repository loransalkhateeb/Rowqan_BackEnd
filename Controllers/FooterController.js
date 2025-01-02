const Footer = require('../Models/FooterModel');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const {client} = require('../Utils/redisClient')

exports.createFooter = async (req, res) => {
  try {
    const { title, lang } = req.body;
    if (!title || !lang) {
      return res.status(400).json(ErrorResponse("Title and language are required."));
    }

   
    const [newFooter, created] = await Footer.findOrCreate({
      where: { title, lang },
      defaults: { title, lang }
    });

    if (!created) {
      return res
        .status(400)
        .json(ErrorResponse("Footer with the same title and language already exists"));
    }

    res.status(201).json(
    newFooter,
    );
  } catch (error) {
    console.error("Error creating footer:", error);
    res.status(500).json(ErrorResponse("Failed to create footer"));
  }
};




exports.getAllFooters = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const {lang} = req.params
    if (!lang) {
      return res.status(400).json(ErrorResponse("Language is required"));
    }

    const cacheKey = `footers:lang:${lang}:page:${page}:limit:${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
    );
    }

  
    const footers = await Footer.findAll({
      where: { lang },
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (footers.length === 0) {
      return res
        .status(404)
        .json(ErrorResponse("No footers found for the specified language"));
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(footers));

    res.status(200).json(
      footers,
    );
  } catch (error) {
    console.error("Error fetching footers:", error);
    res.status(500).json(
      ErrorResponse("Failed to fetch footers", [
        "An internal server error occurred.",
      ])
    );
  }
};



exports.getFooterById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!id || !lang) {
      return res.status(400).json(ErrorResponse("ID and Language are required"));
    }

    const cacheKey = `footer:${id}:lang:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for footer:", cacheKey);
      return res.status(200).json(
        JSON.parse(cachedData),
    );
    }
    console.log("Cache miss for footer:", cacheKey);

   
    const footer = await Footer.findOne({
      where: { id, lang },
    });

    if (!footer) {
      return res
        .status(404)
        .json(
          ErrorResponse("Footer not found", [
            "No Footer found with the given ID and language.",
          ])
        );
    }

   
    await client.setEx(cacheKey, 3600, JSON.stringify(footer));

    return res.status(200).json(
      footer,
    );
  } catch (error) {
    console.error("Error fetching footer:", error);
    return res.status(500).json(
      ErrorResponse("Failed to fetch Footer entry", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};


exports.updateFooter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, lang } = req.body;

    const validationErrors = validateInput({ title, lang });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

   
    const footerEntry = await Footer.findByPk(id);
    if (!footerEntry) {
      return res
        .status(404)
        .json(
          ErrorResponse("Footer entry not found", [
            "No Footer entry found with the given ID.",
          ])
        );
    }

 
    const updatedFields = {};
    if (title && title !== footerEntry.title) updatedFields.title = title;
    if (lang && lang !== footerEntry.lang) updatedFields.lang = lang;

  
    if (Object.keys(updatedFields).length > 0) {
      await footerEntry.update(updatedFields);
    }

   
    const updatedData = footerEntry.toJSON();

    return res.status(200).json(
     updatedData,
    );
  } catch (error) {
    console.error("Error in updateFooter:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to update Footer entry", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};





exports.deleteFooter = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!id || !lang) {
      return res.status(400).json(
        ErrorResponse("ID and Language are required", [
          "Both ID and language parameters must be provided.",
        ])
      );
    }

    const [footer, _] = await Promise.all([
      Footer.findOne({ where: { id, lang } }),
      client.del(`footer:${id}:lang:${lang}`),
    ]);

    if (!footer) {
      return res.status(404).json(
        ErrorResponse("Footer not found", [
          "No Footer found with the given ID and language.",
        ])
      );
    }

    await footer.destroy();

    return res.status(200).json({ message: "Footer deleted successfully" });
  } catch (error) {
    console.error("Error deleting footer:", error);

    return res.status(500).json(
      ErrorResponse("Failed to delete Footer", [
        "An internal server error occurred. Please try again later.",
      ])
    );
  }
};
