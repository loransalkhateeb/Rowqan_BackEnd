const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const ReservationLandsModel = require('../Models/ReservationsLandsModel');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');

exports.createReservationLand = async (req, res) => {
  try {
    const { date, time, lang, available_land_id } = req.body;

    
    const validationErrors = validateInput({ date, time, lang, available_land_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const existingReservation = await ReservationLandsModel.findOne({
      where: {
        date: date,
        time: time,
        available_land_id: available_land_id,
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        message: lang === 'en' 
          ? 'This date and time are already reserved' 
          : 'هذا التاريخ والوقت محجوزين بالفعل',
      });
    }

    const newReservation = await ReservationLandsModel.create({
      date,
      time,
      lang,
      available_land_id,
    });

    res.status(201).json({
      message: lang === 'en' ? 'Reservation created successfully' : 'تم إنشاء الحجز بنجاح',
      reservation: newReservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create reservation',
    });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { lang } = req.params;

    const validationErrors = validateInput({ lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const reservations = await ReservationLandsModel.findAll({
      where: { lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title', 'price'],
      },
    });

    if (reservations.length === 0) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'No reservations found' 
          : 'لا توجد حجوزات',
      });
    }

    res.status(200).json({
      message: lang === 'en' 
        ? 'Reservations retrieved successfully' 
        : 'تم استرجاع الحجوزات بنجاح',
      reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' ? 'Failed to retrieve reservations' : 'فشل في استرجاع الحجوزات' 
    });
  }
};

exports.getReservationByAvailable_land_id = async (req, res) => {
  try {
    const { available_land_id, lang } = req.params;

 
    const validationErrors = validateInput({ available_land_id, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const reservation = await ReservationLandsModel.findAll({
      where: { available_land_id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    res.status(200).json({
      message: lang === 'en' 
        ? 'Reservation retrieved successfully' 
        : 'تم استرجاع الحجز بنجاح',
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' 
        ? 'Failed to retrieve reservation' 
        : 'فشل في استرجاع الحجز' 
    });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id, lang } = req.params;


    const validationErrors = validateInput({ id, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const reservation = await ReservationLandsModel.findOne({
      where: { id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    res.status(200).json({
      message: lang === 'en' 
        ? 'Reservation retrieved successfully' 
        : 'تم استرجاع الحجز بنجاح',
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' 
        ? 'Failed to retrieve reservation' 
        : 'فشل في استرجاع الحجز' 
    });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, lang, available_land_id } = req.body;

  
    const validationErrors = validateInput({ date, time, lang, available_land_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const reservation = await ReservationLandsModel.findOne({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    reservation.date = date || reservation.date;
    reservation.time = time || reservation.time;
    reservation.lang = lang || reservation.lang;
    reservation.available_land_id = available_land_id || reservation.available_land_id;

    await reservation.save();

    res.status(200).json({
      message: lang === 'en' 
        ? 'Reservation updated successfully' 
        : 'تم تحديث الحجز بنجاح',
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' 
        ? 'Failed to update reservation' 
        : 'فشل في تحديث الحجز' 
    });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const validationErrors = validateInput({ id, lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const reservation = await ReservationLandsModel.findOne({
      where: { id, lang },
    });

    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    await reservation.destroy();

    res.status(200).json({
      message: lang === 'en' 
        ? 'Reservation deleted successfully' 
        : 'تم حذف الحجز بنجاح',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' 
        ? 'Failed to delete reservation' 
        : 'فشل في حذف الحجز' 
    });
  }
};
