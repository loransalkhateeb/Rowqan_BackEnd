const Status = require('../Models/StatusModel'); 
const { validateInput } = require('../Utils/validateInput');
const { ErrorResponse } = require('../Utils/validateInput');
const {client} = require('../Utils/redisClient')


exports.createStatus = async (req, res, next) => {
  
  try {
    const { status, lang } = req.body;
    const { error } = validateInput(req.body);
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400)); 
    }

    const existingStatus = await Status.findOne({ where: { status, lang } });
    if (existingStatus) {
      return next(new ErrorResponse('Status with the same name and language already exists', 400));  
    }


    const newStatus = await Status.create({ status, lang });

    res.status(201).json(
      newStatus,
    );
  } catch (error) {
    next(new ErrorResponse('Failed to create Status', 500)); 
  }
};

exports.getAllStatuses = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

   
    const cacheKey = `statuses:lang:${lang}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    
    const statuses = await Status.findAll({ where: { lang } });

    if (!statuses.length) {
      return res.status(404).json({ error: 'No statuses found for this language' });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(statuses));

    res.status(200).json(
      statuses,
    );
  } catch (error) {
    console.error("Error in getAllStatuses:", error.message);
    res.status(500).json({
      error: 'Failed to retrieve statuses',
      message: "An internal server error occurred. Please try again later.",
    });
  }
};



exports.getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    
    const cacheKey = `status:${id}:lang:${lang}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      console.log("Cache hit for status:", id);
      return res.status(200).json(
        JSON.parse(cachedData)
      );
    }
    console.log("Cache miss for status:", id);

    
    const status = await Status.findOne({
      where: { id, lang }
    });

    if (!status) {
      return res.status(404).json({
        error: 'Status not found for the specified language'
      });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(status));

    res.status(200).json({ status });
  } catch (error) {
    console.error("Error in getStatusById:", error);

    res.status(500).json({
      error: 'Failed to fetch Status',
      message: "An internal server error occurred. Please try again later."
    });
  }
};



exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lang } = req.body;

    const { error } = validateStatusInput({ status, lang });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const statusRecord = await Status.findOne({ where: { id, lang } });

    if (!statusRecord) {
      return res.status(404).json({ error: 'Status not found for the specified language' });
    }

    statusRecord.status = status || statusRecord.status;
    statusRecord.lang = lang || statusRecord.lang;

    await statusRecord.save();

    res.status(200).json(
     statusRecord,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Status' });
  }
};


exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;


    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    
    const [status, _] = await Promise.all([
      Status.findOne({ where: { id, lang } }),
      client.del(`status:${id}:lang:${lang}`), 
    ]);

    if (!status) {
      return res.status(404).json({
        error: 'Status not found for the specified language',
      });
    }
    
    await status.destroy();
   
    return res.status(200).json({
      message: 'Status deleted successfully',
    });
  } catch (error) {
    console.error("Error in deleteStatus:", error);

    return res.status(500).json({
      error: 'Failed to delete Status',
      message: "An internal server error occurred. Please try again later.",
    });
  }
};
