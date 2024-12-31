const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const ReservationLandsModel = require('../Models/ReservationsLandsModel');
const CategoriesLandsModel = require('../Models/CategoriesLandsModel');
const {client} = require('../Utils/redisClient')


exports.createReservationLand = async (req, res) => {
  try {
    const { date, time, lang, available_land_id,user_id } = req.body;

    
    const validationErrors = validateInput({ date, time, lang, available_land_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const existingReservation = await ReservationLandsModel.findOne({
      where: {
        date: date,
        time: time,
        available_land_id: available_land_id,
        user_id: user_id
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
      user_id
    });

    res.status(201).json(
     newReservation,
  );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create reservation',
    });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const {lang} = req.params
    const offset = (page - 1) * limit;

    const validationErrors = validateInput({ lang });
    if (validationErrors.length > 0) {
      return res.status(400).json(ErrorResponse(lang, validationErrors));
    }

    const cacheKey = `reservations:page:${page}:limit:${limit}:lang:${lang}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }

    const reservations = await ReservationLandsModel.findAll({
      where: { lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title', 'price'],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (reservations.length === 0) {
      return res.status(404).json({
 'No reservations found' : 'لا توجد حجوزات',
      });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(reservations));

    res.status(200).json(
      reservations,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'Failed to retrieve reservations' : 'فشل في استرجاع الحجوزات',
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

    const cacheKey = `reservation:available_land_id:${available_land_id}:lang:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation:", available_land_id);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation:", available_land_id);

   
    const reservation = await ReservationLandsModel.findAll({
      where: { available_land_id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'],
      },
    });

    if (reservation.length === 0) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    
    await client.setEx(cacheKey, 3600, JSON.stringify(reservation));

    res.status(200).json(  
      reservation,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: lang === 'en' 
        ? 'Failed to retrieve reservation' 
        : 'فشل في استرجاع الحجز' 
    });
  }
};






exports.getReservationByUser_id = async (req, res) => {
  try {
    const { user_id, lang } = req.params;

    const reservations = await ReservationLandsModel.findAll({
      where: { user_id, lang },
      include: {
        model: CategoriesLandsModel,
        attributes: ['id', 'title'], 
      },
    });

    if (!reservations) {
      return res.status(404).json({
        error: lang === 'en' 
          ? 'Reservation not found' 
          : 'الحجز غير موجود',
      });
    }

    res.status(200).json(
      reservations,
    );
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

    res.status(200).json(
      reservation,
  );
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

    res.status(200).json(
  
      reservation,
    );
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
