const ReservationDates = require('../Models/ReservationDatesModel');
const Chalet = require('../Models/ChaletsModel');
const RightTimeModel = require('../Models/RightTimeModel');
const { Sequelize } = require('sequelize');

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

    res.status(201).json({
      message: 'Reservation Date created successfully',
      reservationDate: newReservationDate,
    });
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

    const chalet = await Chalet.findByPk(chalet_id, {
      include: [
        {
          model: ReservationDates,
          where: { lang },
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

    res.status(200).json({
      message: 'Reservation Dates retrieved successfully',
      reservationDates: chalet.ReservationDates.map(reservation => ({
        ...reservation.dataValues,
        rightTime: reservation.RightTime ? reservation.RightTime.dataValues : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching reservation dates:", error.message);
    return res.status(500).json({ error: 'Failed to retrieve Reservation Dates' });
  }
};

exports.getAllReservationsDates = async (req, res) => {
  const { lang } = req.params;
  try {
    if (!validateLang(lang)) {
      return res.status(400).json({ error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة' });
    }

    const reservationDates = await ReservationDates.findAll({
      where: { lang },
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
    });

    if (!reservationDates.length) {
      return res.status(404).json({ error: lang === 'en' ? 'No reservation dates found' : 'لم يتم العثور على تواريخ الحجز' });
    }

    res.status(200).json({
      message: lang === 'en' ? 'Reservation Dates retrieved successfully' : 'تم جلب تواريخ الحجز بنجاح',
      reservationDates,
    });
  } catch (error) {
    console.error('Error fetching reservation dates:', error.message);
    return res.status(500).json({ error: lang === 'en' ? 'Failed to retrieve Reservation Dates' : 'فشل في جلب تواريخ الحجز' });
  }
};

exports.getReservationDateById = async (req, res) => {
  try {
    const { id, lang } = req.params;
    if (!validateLang(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

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

    res.status(200).json({
      message: 'Reservation Date retrieved successfully',
      reservationDate,
    });
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

    res.status(200).json({
      message: 'Reservation Date updated successfully',
      reservationDate,
    });
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

    const reservationDate = await ReservationDates.findOne({ where: { id, lang } });
    if (!reservationDate) {
      return res.status(404).json({ error: 'Reservation Date not found for the specified language' });
    }

    await reservationDate.destroy();

    res.status(200).json({
      message: 'Reservation Date deleted successfully',
    });
  } catch (error) {
    console.error("Error deleting Reservation Date:", error.message);
    return res.status(500).json({ error: 'Failed to delete Reservation Date' });
  }
};
