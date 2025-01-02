const Reservation = require('../Models/ReservationsModel');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');
const Chalet = require('../Models/ChaletsModel');
const Types_Events = require('../Models/TypesEventsModel');
const User = require('../Models/UsersModel');
const CashBack = require('../Models/CashBackModel');
const { validateInput, ErrorResponse } = require("../Utils/validateInput");

exports.createReservation = async (req, res) => {
  try {
    const { total_amount, lang, land_id, Chalet_id, Event_id, User_id } = req.body;
    console.log('Total amount received:', total_amount);

  
    const inputValidation = validateInput(req.body);
    if (inputValidation.error) {
      return ErrorResponse(res, 400, inputValidation.error);  
    }

    if (isNaN(total_amount) || total_amount <= 0) {
      return ErrorResponse(res, 400, lang === 'en' ? 'Invalid total amount' : 'المبلغ الإجمالي غير صالح');
    }

    if (!['en', 'ar'].includes(lang)) {
      return ErrorResponse(res, 400, lang === 'en' ? 'Invalid language. Please use "en" or "ar".' : 'اللغة غير صالحة. استخدم "en" أو "ar".');
    }

    const cashback_amount = (total_amount * 5) / 100;
    console.log('Cashback amount calculated:', cashback_amount);

    const parsedCashbackAmount = parseFloat(cashback_amount.toFixed(2));

    const newReservation = await Reservation.create({
      total_amount,
      cashback_amount: parsedCashbackAmount,
      lang,
      land_id,
      Chalet_id,
      Event_id,
      User_id,
    });

    console.log('Reservation created:', newReservation);

    const newCashback = await CashBack.create({
      amount: parsedCashbackAmount,
      reservation_id: newReservation.id,
    });

    console.log('Cashback created:', newCashback);

    res.status(201).json({
      message: lang === 'en' ? 'Reservation created successfully' : 'تم إنشاء الحجز بنجاح',
      reservation: newReservation,
      cashback: newCashback,
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to create reservation' : 'فشل في إنشاء الحجز');
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const lang = req.params.lang || 'en';

    const reservations = await Reservation.findAll({
      include: [
        {
          model: CategoriesLandsModel,
          attributes: ['id', 'title'],
        },
        {
          model: Chalet,
          attributes: ['id', 'title'],
        },
        {
          model: Types_Events,
          attributes: ['id', 'event_type'],
        },
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (reservations.length === 0) {
      return ErrorResponse(res, 404, lang === 'en' ? 'No reservations found' : 'لا توجد حجوزات');
    }

    res.status(200).json(
      reservations,
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to retrieve reservations' : 'فشل في استرجاع الحجوزات');
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return ErrorResponse(res, 400, lang === 'en' ? 'Invalid language. Please use "en" or "ar".' : 'اللغة غير صالحة. يرجى استخدام "en" أو "ar".');
    }

    const reservation = await Reservation.findOne({
      where: { id, lang },
      include: [
        {
          model: CategoriesLandsModel,
          attributes: ['id', 'title'],
        },
        {
          model: Chalet,
          attributes: ['id', 'title'],
        },
        {
          model: Types_Events,
          attributes: ['id', 'event_type'],
        },
        {
          model: User,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!reservation) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود');
    }

    res.status(200).json(
      reservation,
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to retrieve reservation' : 'فشل في استرجاع الحجز');
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { total_amount, cashback_amount, lang, land_id, Chalet_id, Event_id, User_id } = req.body;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود');
    }

    reservation.total_amount = total_amount || reservation.total_amount;
    reservation.cashback_amount = cashback_amount || reservation.cashback_amount;
    reservation.lang = lang || reservation.lang;
    reservation.land_id = land_id || reservation.land_id;
    reservation.Chalet_id = Chalet_id || reservation.Chalet_id;
    reservation.Event_id = Event_id || reservation.Event_id;
    reservation.User_id = User_id || reservation.User_id;

    await reservation.save();

    res.status(200).json(
      reservation,
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to update reservation' : 'فشل في تحديث الحجز');
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const reservation = await Reservation.findOne({ where: { id, lang } });

    if (!reservation) {
      return ErrorResponse(res, 404, lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود');
    }

    await reservation.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Reservation deleted successfully' : 'تم حذف الحجز بنجاح',
    });
  } catch (error) {
    console.error(error);
    ErrorResponse(res, 500, lang === 'en' ? 'Failed to delete reservation' : 'فشل في حذف الحجز');
  }
};
