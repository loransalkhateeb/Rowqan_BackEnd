const ReservationDates = require('../Models/ReservationDatesModel');
const Chalet = require('../Models/ChaletsModel');
const RightTimeModel = require('../Models/RightTimeModel');
const { Sequelize } = require('sequelize');
const {client} = require('../Utils/redisClient')


const validateLang = (lang) => ['en', 'ar'].includes(lang);

exports.createReservationDate = async (req, res) => {
  try {
    const { chalet_id, right_time_id } = req.body;

  
    if (!chalet_id || !right_time_id) {
      return res.status(400).json({ error: 'Chalet ID and RightTime ID are required' });
    }

    const [chalet, rightTime] = await Promise.all([
      Chalet.findByPk(chalet_id),
      RightTimeModel.findByPk(right_time_id)
    ]);

    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
    }

    const newReservationDate = await ReservationDates.create({
      chalet_id,
      right_time_id,
    });

    res.status(201).json(
     newReservationDate,
    );
  } catch (error) {
    console.error("Error creating Reservation Date:", error.message);
    return res.status(500).json({ error: 'Failed to create Reservation Date' });
  }
};

exports.getReservationDatesByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    if (!validateLang(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const cacheKey = `reservationDates:${chalet_id}:lang:${lang}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation dates:", chalet_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation dates:", chalet_id);

   
    const chalet = await Chalet.findByPk(chalet_id, {
      include: [
        {
          model: ReservationDates,
          where: { chalet_id },
          required: false,
          include: [
            {
              model: RightTimeModel,
              where: { id: Sequelize.col('ReservationDates.right_time_id') },
              required: false,
              attributes: ['name', 'time'],
            },
          ],
        },
      ],
    });

 
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    
    const reservationDates = chalet.ReservationDates.map(reservation => ({
      ...reservation.dataValues,
      rightTime: reservation.RightTime ? reservation.RightTime.dataValues : null,
    }));


    await client.setEx(cacheKey, 3600, JSON.stringify(reservationDates));

    return res.status(200).json(
     
      reservationDates,
  );
  } catch (error) {
    console.error("Error fetching reservation dates:", error.message);
    return res.status(500).json({ error: 'Failed to retrieve Reservation Dates' });
  }
};


exports.getAllReservationsDates = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!validateLang(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }


    const cacheKey = `reservationDates:page:${page}:limit:${limit}:lang:${lang}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

  
    const reservationDates = await ReservationDates.findAll({
      include: [
        {
          model: Chalet,
          attributes: ['id', 'title'],
        },
        {
          model: RightTimeModel,
          attributes: ['time', 'name'],
        },
      ],
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!reservationDates.length) {
      return res.status(404).json({
        error: lang === 'en' ? 'No reservation dates found' : 'لم يتم العثور على تواريخ الحجز',
      });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(reservationDates));

    return res.status(200).json(
      reservationDates,
    );
  } catch (error) {
    console.error('Error fetching reservation dates:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve Reservation Dates',
    });
  }
};




exports.getReservationDateById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!validateLang(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const cacheKey = `reservationDate:${id}:lang:${lang}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation date:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation date:", id);

    
    const reservationDate = await ReservationDates.findOne({
      where: { id, lang },
      include: [
        {
          model: Chalet,
          required: true,
        },
        {
          model: RightTimeModel,
          required: true,
        }
      ]
    });

    
    if (!reservationDate) {
      return res.status(404).json({ error: 'Reservation Date not found for the specified language' });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(reservationDate));

    return res.status(200).json(
      reservationDate,
    );
  } catch (error) {
    console.error("Error fetching reservation date:", error.message);
    return res.status(500).json({ error: 'Failed to retrieve Reservation Date' });
  }
};


exports.updateReservationDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, lang, chalet_id, right_time_id } = req.body;

  
    if (!date || !lang || !chalet_id || !right_time_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const reservationDate = await ReservationDates.findOne({ where: { id } });
    if (!reservationDate) {
      return res.status(404).json({ error: 'Reservation Date not found for the specified language' });
    }

    const [chalet, rightTime] = await Promise.all([
      Chalet.findByPk(chalet_id),
      RightTimeModel.findByPk(right_time_id)
    ]);

    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
    }

    reservationDate.date = date;
    reservationDate.lang = lang;
    reservationDate.chalet_id = chalet_id;
    reservationDate.right_time_id = right_time_id;

    await reservationDate.save();

    res.status(200).json(
      reservationDate,
    );
  } catch (error) {
    console.error("Error updating Reservation Date:", error.message);
    return res.status(500).json({ error: 'Failed to update Reservation Date' });
  }
};

exports.deleteReservationDate = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!validateLang(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    
    const cacheKey = `reservationDate:${id}:lang:${lang}`;

    
    const [reservationDate, _] = await Promise.all([
      ReservationDates.findOne({ where: { id} }),
      client.del(cacheKey),
    ]);

    if (!reservationDate) {
      return res.status(404).json({
        error: 'Reservation Date not found for the specified language',
      });
    }

  
    await reservationDate.destroy();

    return res.status(200).json({
      message: 'Reservation Date deleted successfully',
    });
  } catch (error) {
    console.error("Error deleting Reservation Date:", error.message);
    return res.status(500).json({
      error: 'Failed to delete Reservation Date',
    });
  }
};
