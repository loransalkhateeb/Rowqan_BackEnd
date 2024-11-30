const  ReservationDates = require('../Models/ReservationDatesModel');
const  Chalet  = require('../Models/ChaletsModel');
const  RightTimeModel  = require('../Models/RightTimeModel'); 


exports.createReservationDate = async (req, res) => {
  try {
    const { date, lang, chalet_id, right_time_id } = req.body;

    if (!date || !lang || !chalet_id || !right_time_id) {
      return res.status(400).json({ error: 'Date, language, chalet_id, and right_time_id are required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    const rightTime = await RightTimeModel.findByPk(right_time_id);
    if (!rightTime) {
      return res.status(404).json({ error: 'RightTime not found' });
    }

    const newReservationDate = await ReservationDates.create({
      date,
      lang,
      chalet_id,
      right_time_id,
    });

    res.status(201).json({
      message: 'Reservation Date created successfully',
      reservationDate: newReservationDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Reservation Date' });
  }
};


exports.getReservationDatesByChaletId = async (req, res) => {
  try {
    const { chalet_id,lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const chalet = await Chalet.findByPk(chalet_id,{
      include: {
        model: ReservationDates,
        where: { lang },
        required: false,
      },
    });

    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    res.status(200).json({
      message: 'Reservation Dates retrieved successfully',
      reservationDates: chalet.ReservationDates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Reservation Dates' });
  }
};


exports.getReservationDateById = async (req, res) => {
  try {
    const { id,lang } = req.params;
    if (!['en', 'ar'].includes(lang)) {
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
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Reservation Date' });
  }
};


exports.updateReservationDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, lang, chalet_id, right_time_id } = req.body;

    if (!date || !lang || !chalet_id || !right_time_id) {
      return res.status(400).json({ error: 'Date, language, chalet_id, and right_time_id are required' });
    }

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const reservationDate = await ReservationDates.findOne({ where: { id} });
    if (!reservationDate) {
      return res.status(404).json({ error: 'Reservation Date not found for the specified language' });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({ error: 'Chalet not found' });
    }

    const rightTime = await RightTimeModel.findByPk(right_time_id);
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
    console.error(error);
    res.status(500).json({ error: 'Failed to update Reservation Date' });
  }
};

exports.deleteReservationDate = async (req, res) => {
  try {
    const { id,lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
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
    console.error(error);
    res.status(500).json({ error: 'Failed to delete Reservation Date' });
  }
};
