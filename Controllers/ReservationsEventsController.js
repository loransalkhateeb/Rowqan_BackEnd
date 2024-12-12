const Reservation_Events = require('../Models/ReservationEventsModel');
const Available_Events = require('../Models/AvailableEvents');
const { Op } = require('sequelize');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createReservationEvent = async (req, res) => {
  try {
    const { date, start_time, end_time, lang, available_event_id } = req.body;

   
    const validationErrors = validateInput({ date, start_time, end_time, lang, available_event_id });
    if (validationErrors) {
      return ErrorResponse(res, 400, validationErrors);
    }

    const event = await Available_Events.findByPk(available_event_id);
    if (!event) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Event not found' : 'الحدث غير موجود');
    }

    const existingReservation = await Reservation_Events.findOne({
      where: {
        date: date,
        available_event_id: available_event_id,
        [Op.or]: [
          {
            start_time: { [Op.lte]: end_time },
            end_time: { [Op.gte]: start_time },
          },
        ],
      },
    });

    if (existingReservation) {
      return ErrorResponse(res, 400, 'This time slot is already reserved');
    }

    const newReservation = await Reservation_Events.create({
      date,
      start_time,
      end_time,
      lang,
      available_event_id,
    });

    res.status(201).json({
      message: lang === 'en' ? 'Reservation created successfully' : 'تم إنشاء الحجز بنجاح',
      reservation: newReservation,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to create reservation' : 'فشل في إنشاء الحجز');
  }
};

exports.updateReservationEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, start_time, end_time, lang, available_event_id } = req.body;

    const reservation = await Reservation_Events.findByPk(id);
    if (!reservation) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Reservation not found' : 'لم يتم العثور على الحجز');
    }

    const event = await Available_Events.findByPk(available_event_id);
    if (!event) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Event not found' : 'الحدث غير موجود');
    }

    reservation.date = date;
    reservation.start_time = start_time;
    reservation.end_time = end_time;
    reservation.lang = lang;
    reservation.available_event_id = available_event_id;

    await reservation.save();

    res.status(200).json({
      message: lang === 'en' ? 'Reservation updated successfully' : 'تم تحديث الحجز بنجاح',
      reservation,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to update reservation' : 'فشل في تحديث الحجز');
  }
};

exports.deleteReservationEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation_Events.findByPk(id);
    if (!reservation) {
      return ErrorResponse(res, 404, 'Reservation not found');
    }

    await reservation.destroy();

    res.status(200).json({
      message: 'Reservation deleted successfully',
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, 'Failed to delete reservation');
  }
};

exports.getAllReservationEvents = async (req, res) => {
  try {
    const { lang } = req.params;

    const reservations = await Reservation_Events.findAll({
      where: { lang },
      include: {
        model: Available_Events,
        attributes: ['id', 'title'],
      },
    });

    if (reservations.length === 0) {
      return ErrorResponse(res, 404, lang === 'en' ? 'No reservations found' : 'لم يتم العثور على حجوزات');
    }

    res.status(200).json({
      message: lang === 'en' ? 'Reservations retrieved successfully' : 'تم جلب الحجوزات بنجاح',
      reservations,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, 'Failed to retrieve reservations');
  }
};

exports.getAllReservationEventsByAvailableId = async (req, res) => {
  try {
    const { available_event_id, lang } = req.params;

    const reservations = await Reservation_Events.findAll({
      where: { available_event_id, lang },
      include: {
        model: Available_Events,
        attributes: ['id', 'title', 'image', 'no_people', 'price', 'rating', 'location', 'cashback', 'time', 'description'],
      },
    });

    if (reservations.length === 0) {
      return ErrorResponse(res, 404, lang === 'en' ? 'No reservations found' : 'لم يتم العثور على حجوزات');
    }

    res.status(200).json({
      message: lang === 'en' ? 'Reservations retrieved successfully' : 'تم جلب الحجوزات بنجاح',
      reservations,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, 'Failed to retrieve reservations');
  }
};

exports.getReservationEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation_Events.findByPk(id, {
      include: {
        model: Available_Events,
        attributes: ['id', 'title'],
      },
    });

    if (!reservation) {
      return ErrorResponse(res, 404, 'Reservation not found');
    }

    res.status(200).json({
      message: 'Reservation retrieved successfully',
      reservation,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, 'Failed to retrieve reservation');
  }
};
