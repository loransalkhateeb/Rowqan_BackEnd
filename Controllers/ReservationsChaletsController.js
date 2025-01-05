const { ErrorResponse } = require('../Utils/validateInput');
const Reservations_Chalets = require('../Models/Reservations_Chalets');
const Chalet = require('../Models/ChaletsModel');
const User = require('../Models/UsersModel');
const RightTimeModel = require('../Models/RightTimeModel');
const Wallet = require('../Models/WalletModel');
const { Op } = require('sequelize');
const { client } = require('../Utils/redisClient');
const moment = require('moment');

exports.createReservation = async (req, res) => {
  try {
    const {
      initial_amount,
      date,
      lang,
      additional_visitors,
      number_of_days,
      user_id,
      chalet_id,
      right_time_id,
      used_cashback,
    } = req.body || {};

    if (!initial_amount || !date || !lang || !chalet_id || !right_time_id) {
      return res.status(400).json(
        ErrorResponse("Validation failed", [
          "Initial amount, date, lang, chalet_id, and right_time_id are required",
        ])
      );
    }

    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid date format' : 'تنسيق التاريخ غير صالح',
      });
    }

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    const chalet = await Chalet.findByPk(chalet_id);
    if (!chalet) {
      return res.status(404).json({
        error: lang === 'en' ? 'Chalet not found' : 'الشاليه غير موجود',
      });
    }

    const reserve_price = chalet.reserve_price;

    const rightTime = await RightTimeModel.findByPk(right_time_id);
    if (!rightTime) {
      return res.status(404).json({
        error: lang === 'en' ? 'Right time not found' : 'الوقت المناسب غير موجود',
      });
    }

    let finalPrice;
    if (['Morning', 'Evening', 'Full day'].includes(rightTime.name)) {
      finalPrice = reserve_price + rightTime.price;
    } else {
      return res.status(400).json({ error: "Invalid time selection" });
    }

    let additional_fee = additional_visitors > 0 ? additional_visitors * 10 : 0;
    let days_fee = number_of_days > 0 ? number_of_days * 20 : 0;

    let total_amount = finalPrice + additional_fee + days_fee;
    const cashback = total_amount * 0.05;

    let usable_cashback = 0;
    let remaining_cashback = 0;

    if (user_id) {
      const wallet = await Wallet.findOne({ where: { user_id } });

      if (wallet) {
        usable_cashback = wallet.cashback_balance;

        if (used_cashback) {
          if (used_cashback > usable_cashback) {
            return res.status(400).json({
              error: lang === 'en' ? 'Insufficient cashback balance' : 'رصيد الكاش باك غير كافٍ',
            });
          }
          usable_cashback = used_cashback;
        }

        wallet.cashback_balance -= usable_cashback;
        await wallet.save();

        remaining_cashback = usable_cashback;
      } else {
        usable_cashback = 0;
        remaining_cashback = 0;
      }
    }

    const remaining_amount = total_amount - initial_amount - usable_cashback;

    const existingReservation = await Reservations_Chalets.findOne({
      where: {
        chalet_id,
        date: formattedDate,
        right_time_id: rightTime.id,
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        error: lang === 'en'
          ? 'This chalet is already reserved for the selected date and time'
          : 'هذا الشاليه محجوز بالفعل في التاريخ والوقت المحدد',
      });
    }

    if (rightTime.name === 'Full Day') {
      const conflictingReservation = await Reservations_Chalets.findOne({
        where: {
          chalet_id,
          date: formattedDate,
          right_time_id: {
            [Op.ne]: rightTime.id,
          },
        },
      });

      if (conflictingReservation) {
        return res.status(400).json({
          error: lang === 'en'
            ? 'This chalet is already reserved for the selected date for a different time slot'
            : 'هذا الشاليه محجوز بالفعل في التاريخ المحدد في وقت آخر',
        });
      }
    }

    const reservation = await Reservations_Chalets.create({
      initial_amount,
      reserve_price,
      total_amount,
      cashback,
      remaining_amount,
      date: formattedDate,
      lang,
      status: initial_amount > 0 ? 'Reserved' : 'Pending',
      additional_visitors,
      number_of_days,
      user_id: user_id || null,
      chalet_id,
      right_time_id,
    });

    res.status(201).json({
      message: lang === 'en' ? 'Reservation created successfully' : 'تم إنشاء الحجز بنجاح',
      reservation: {
        id: reservation.id,
        initial_amount,
        reserve_price,
        total_amount,
        cashback,
        remaining_amount,
        date: formattedDate,
        lang,
        status: reservation.status,
        additional_visitors,
        number_of_days,
        user_id,
        chalet_id,
        right_time_id,
      },
      wallet: user_id
        ? {
            total_balance: wallet?.total_balance || 0,
            cashback_balance: wallet?.cashback_balance || 0,
          }
        : null,
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json(
      ErrorResponse('Failed to create reservation', [
        'An internal server error occurred.',
      ])
    );
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    const cacheKey = `reservations:page:${page}:limit:${limit}:lang:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservations:", lang);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log("Cache miss for reservations:", lang);

    const reservations = await Reservations_Chalets.findAll({
      include: [
        {
          model: Chalet,
          as: 'chalet',
          attributes: ['id', 'title', 'reserve_price'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: RightTimeModel,
          as: 'rightTime',
          attributes: ['id', 'time'],
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservations found' : 'لا توجد حجوزات',
      });
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(reservations));

    return res.status(200).json(
      reservations.map(reservation => ({
        id: reservation.id,
        initial_amount: reservation.initial_amount,
        reserve_price: reservation.reserve_price,
        total_amount: reservation.total_amount,
        cashback: reservation.cashback,
        date: reservation.date,
        lang: reservation.lang,
        status: reservation.status,
        additional_visitors: reservation.additional_visitors,
        number_of_days: reservation.number_of_days,
        user_id: reservation.user_id,
        chalet_id: reservation.chalet_id,
        right_time_id: reservation.right_time_id,
        chalet: reservation.chalet,
        user: reservation.user,
        right_time: reservation.rightTime,
      }))
    );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      error: lang === 'en'
        ? 'Failed to fetch reservations'
        : 'فشل في استرجاع الحجوزات',
    });
  }
};




exports.getReservationById = async (req, res) => {
  try {
    const { lang, id } = req.params; 


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid reservation ID' : 'رقم الحجز غير صحيح',
      });
    }

    const cacheKey = `reservation:${id}:lang:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation:", id);
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation:", id);


    const reservation = await Reservations_Chalets.findOne({
      where: { id: id }, 
      include: [
        {
          model: Chalet,
          as: 'chalet',
          attributes: ['id', 'title', 'reserve_price'], 
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'], 
        },
        {
          model: RightTimeModel,
          as: 'rightTime', 
          attributes: ['id', 'time'], 
        }
      ]
    });

    
    if (!reservation) {
      return res.status(404).json({
        message: lang === 'en' ? 'Reservation not found' : 'لم يتم العثور على الحجز',
      });
    }


    await client.setEx(cacheKey, 3600, JSON.stringify(reservation));

    return res.status(200).json(
      {
        id: reservation.id,
        initial_amount: reservation.initial_amount,
        reserve_price: reservation.reserve_price,
        total_amount: reservation.total_amount,
        cashback: reservation.cashback,
        date: reservation.date,
        lang: reservation.lang,
        status: reservation.status,
        additional_visitors: reservation.additional_visitors,
        number_of_days: reservation.number_of_days,
        user_id: reservation.user_id,
        chalet_id: reservation.chalet_id,
        right_time_id: reservation.right_time_id,
        chalet: reservation.chalet,
        user: reservation.user, 
        right_time: reservation.rightTime, 
      }
  );
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({
      error: lang === 'en' 
        ? 'Failed to fetch reservation' 
        : 'فشل في استرجاع الحجز',
    });
  }
};









exports.getReservationsByChaletId = async (req, res) => {
  try {
    const { chalet_id, lang } = req.params;

    
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    
    if (!chalet_id || isNaN(chalet_id)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid chalet ID' : 'رقم الشاليه غير صحيح',
      });
    }

    const cacheKey = `reservations:${chalet_id}:lang:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservations:", chalet_id);
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservations:", chalet_id);

  
    const reservations = await Reservations_Chalets.findAll({
      where: { chalet_id: chalet_id },
      include: [
        {
          model: Chalet,
          as: 'chalet', 
          attributes: ['id', 'title', 'reserve_price'], 
        },
        {
          model: User,
          as: 'user', 
          attributes: ['id', 'name', 'email'], 
        },
        {
          model: RightTimeModel,
          as: 'rightTime', 
          attributes: ['id', 'time', 'name'], 
        }
      ]
    });

    
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservations found for this chalet' : 'لا توجد حجوزات لهذا الشاليه',
      });
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(reservations));

    return res.status(200).json(
       reservations.map(reservation => ({
        id: reservation.id,
        initial_amount: reservation.initial_amount,
        reserve_price: reservation.reserve_price,
        total_amount: reservation.total_amount,
        cashback: reservation.cashback,
        date: reservation.date,
        lang: reservation.lang,
        status: reservation.status,
        additional_visitors: reservation.additional_visitors,
        number_of_days: reservation.number_of_days,
        user_id: reservation.user_id,
        chalet_id: reservation.chalet_id,
        right_time_id: reservation.right_time_id,
        chalet: reservation.chalet,
        user: reservation.user,
        right_time: reservation.rightTime,
      })),
  );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      error: lang === 'en' 
        ? 'Failed to fetch reservations' 
        : 'فشل في استرجاع الحجوزات',
    });
  }
};






exports.getAvailableTimesByDate = async (req, res) => {
  const { chalet_id, date } = req.params; 
  const formattedDate = moment(date).format('YYYY-MM-DD'); 

  try {
    const startOfDay = moment(formattedDate).startOf('day').toDate(); 
    const endOfDay = moment(formattedDate).endOf('day').toDate();      

   
    const reservations = await Reservations_Chalets.findAll({
      where: {
        date: {
          [Op.gte]: startOfDay, 
          [Op.lt]: endOfDay,     
        },
        chalet_id: chalet_id,
      },
      include: [{
        model: RightTimeModel,
        as: 'rightTime',  
      }],
    });

    
    const reservedTimes = reservations.map(reservation => reservation.rightTime.name);

    
    const allTimeSlots = await RightTimeModel.findAll({
      where: {
        chalet_id: chalet_id,
      }
    });

   
    let availableTimeSlots = allTimeSlots.filter(slot => !reservedTimes.includes(slot.name));

   
    if (reservedTimes.includes('Morning') || reservedTimes.includes('Evening')) {
      availableTimeSlots = availableTimeSlots.filter(slot => slot.name !== 'Full day');
    }

  
    res.json(availableTimeSlots);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};






exports.getReservationsByRightTimeName = async (req, res) => {
  try {
    const { id, name, lang } = req.params;

    
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid ID' : 'معرّف غير صالح',
      });
    }

    
    if (!name) {
      return res.status(400).json({
        error: lang === 'en' ? 'Right time name is required' : 'اسم الوقت غير صحيح',
      });
    }

    const cacheKey = `reservationsByRightTime:${id}:${name}:${lang}`;

    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit for reservations by right time:', id, name);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('Cache miss for reservations by right time:', id, name);

    let rightTimes;
    if (name === 'Full day') {
      rightTimes = await RightTimeModel.findAll({
        where: {
          name: { [Op.in]: ['morning', 'evening'] },
        },
      });
    } else {
      rightTimes = await RightTimeModel.findOne({
        where: { name: name },
      });

      rightTimes = rightTimes ? [rightTimes] : [];
    }

    if (!rightTimes || rightTimes.length === 0) {
      return res.status(404).json({
        error: lang === 'en' ? 'Right time not found' : 'الوقت غير موجود',
      });
    }

    const rightTimeIds = rightTimes.map(rt => rt.id);


    const reservations = await Reservations_Chalets.findAll({
      where: { right_time_id: { [Op.in]: rightTimeIds }, user_id: id },
      include: [
        {
          model: Chalet,
          as: 'chalet',
          attributes: ['id', 'title', 'reserve_price'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: RightTimeModel,
          as: 'rightTime',
          attributes: ['id', 'time', 'name', 'price'],
        },
      ],
    });

    
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        message:
          lang === 'en'
            ? 'No reservations found for this right time'
            : 'لا توجد حجوزات لهذا الوقت',
      });
    }

   
    return res.status(200).json(
      reservations.map(reservation => ({
        id: reservation.id,
        initial_amount: reservation.initial_amount,
        reserve_price: reservation.reserve_price,
        total_amount: reservation.total_amount,
        cashback: reservation.cashback,
        date: reservation.date,
        lang: reservation.lang,
        status: reservation.status,
        additional_visitors: reservation.additional_visitors,
        number_of_days: reservation.number_of_days,
        user_id: reservation.user_id,
        chalet_id: reservation.chalet_id,
        right_time_id: reservation.right_time_id,
        chalet: reservation.chalet,
        user: reservation.user,
        right_time: reservation.rightTime,
      }))
    );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      message: lang === 'en' ? 'Failed to fetch reservations' : 'فشل في جلب الحجوزات',
    });
  }
};









exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.lang && !['ar', 'en'].includes(updateData.lang)) {
      return res.status(400).json({
        error: 'Invalid language',
      });
    }

    const reservation = await Reservations_Chalets.findByPk(id);
    if (!reservation) {
      return res.status(404).json({
        error: updateData.lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود',
      });
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        reservation[key] = updateData[key];
      }
    });

    await reservation.save();

    res.status(200).json(
      reservation,
    );
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({
      error: 'Failed to update reservation',
    });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

   
    const [reservation, _] = await Promise.all([
      Reservations_Chalets.findByPk(id),
      client.del(`reservation:${id}`), 
    ]);

    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود',
      });
    }

    await reservation.destroy();

    return res.status(200).json({
      message: lang === 'en' ? 'Reservation deleted successfully' : 'تم حذف الحجز بنجاح',
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);

    return res.status(500).json({
      error: lang === 'en' ? 'Failed to delete reservation' : 'فشل في حذف الحجز',
    });
  }
};
