const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const Reservations_Chalets = require('../Models/Reservations_Chalets');
const Chalet = require('../Models/ChaletsModel');
const User = require('../Models/UsersModel');
const RightTimeModel = require('../Models/RightTimeModel');
const Wallet = require('../Models/WalletModel')
const { Op } = require('sequelize');
const {client} = require('../Utils/redisClient');
const { image } = require("../Config/CloudinaryConfig");


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
    } = req.body;


    const inputValidation = validateInput(req.body, [
      'initial_amount',
      'date',
      'lang',

      'user_id',

      'chalet_id',
      'right_time_id'
    ]);
    

    if (inputValidation.error) {
      return res.status(400).json(inputValidation);
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


    // const user = await User.findByPk(user_id);
    // if (!user) {
    //   return res.status(404).json({
    //     error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
    //   });
    // }


    const rightTime = await RightTimeModel.findByPk(right_time_id);
    if (!rightTime) {
      return res.status(404).json({
        error: lang === 'en' ? 'Right time not found' : 'الوقت المناسب غير موجود',
      });
    }

    
    const existingReservation = await Reservations_Chalets.findOne({
      where: {
        chalet_id,
        date: formattedDate,
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        error: lang === 'en' ? 'This chalet is already reserved for the selected date' : 'هذا الشاليه محجوز بالفعل في التاريخ المحدد',
      });
    }

    
    const reserve_price = chalet.reserve_price;
    let total_amount = reserve_price - initial_amount;
    let cashback = 0;

    if (additional_visitors > 0) {
      total_amount += additional_visitors * 10;
    }

    if (number_of_days > 0) {
      total_amount += number_of_days * 20;
    }

    cashback = total_amount * 0.05;

    
    const reservation = await Reservations_Chalets.create({
      initial_amount,
      reserve_price,
      total_amount,
      cashback,
      date: formattedDate,
      lang,
      status: initial_amount > 0 ? 'Reserved' : 'Pending',
      additional_visitors,
      number_of_days,
      user_id: user_id || null, 
      chalet_id,
      right_time_id,
    });

    let wallet = null;

    
    if (user_id) {
      wallet = await Wallet.findOne({ where: { user_id } });

      if (wallet) {
        wallet.total_balance += total_amount;
        wallet.cashback_balance += cashback;
        await wallet.save();
      } else {
        wallet = await Wallet.create({
          user_id,
          total_balance: total_amount,
          cashback_balance: cashback,
          lang,
        });
      }
    }

    
    res.status(201).json({
      message: lang === 'en' ? 'Reservation created successfully' : 'تم إنشاء الحجز بنجاح',
      reservation: {
        initial_amount,
        reserve_price,
        total_amount,
        cashback,
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
    res.status(500).json({
      error: lang === 'en' ? 'Failed to create reservation' : 'فشل في إنشاء الحجز',
    });
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
      return res.status(200).json(
        JSON.parse(cachedData),
      );
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
      })),
    );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json(
       'Failed to fetch reservations'
    );
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
  try {
    const { chalet_id, date, lang } = req.params;

          client.del(`availableTimes:${chalet_id}`);

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

    
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid date format' : 'تنسيق التاريخ غير صالح',
      });
    }

    const cacheKey = `availableTimes:${chalet_id}:${date}:lang:${lang}`;

   
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for available times:", chalet_id, date);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for available times:", chalet_id, date);

   
    const existingReservations = await Reservations_Chalets.findAll({
      where: {
        chalet_id: chalet_id,
        date: formattedDate,
      },
      attributes: ['right_time_id'],
    });

   
    const reservedTimes = existingReservations.map(reservation => reservation.right_time_id);

    
    let availableTimes = await RightTimeModel.findAll({
      where: {
        id: {
          [Op.notIn]: reservedTimes, 
        }
      },
      attributes: ['id', 'time', 'name', 'price','image'],
    });

   
    const reservedMorning = reservedTimes.includes('morning');
    const reservedEvening = reservedTimes.includes('evening');

    if (reservedMorning || reservedEvening) {
      availableTimes = availableTimes.filter(time => time.name !== 'Full day');
    }

   
    if (availableTimes.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No available times for this date' : 'لا توجد أوقات متاحة لهذا التاريخ',
      });
    }

  
    await client.setEx(cacheKey, 3600, JSON.stringify(availableTimes));

    return res.status(200).json(
      availableTimes.map(time => ({
        id: time.id,
        time: time.time,
        name: time.name,
        price: time.price,
        image: time.image,
      })),
    );

  } catch (error) {
    console.error('Error fetching available times:', error);
    return res.status(500).json({
      error: lang === 'en' ? 'Failed to fetch available times' : 'فشل في استرجاع الأوقات المتاحة',
    });
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

  const { chalet_id, name, lang } = req.params;

  try {
    // Split the rightTimeName to handle cases like "Morning Full day" or "Evening Full day"
    const timePeriods = name.split(' ');

    // Initialize an array to hold all the reservations
    let reservations = [];
    let fullDayAdded = false; // To track if Full day has been added already

    // Step 1: Fetch reservations for each time period requested
    for (let period of timePeriods) {
      if (period === 'Full' || period === 'day') {
        if (!fullDayAdded) {
          // Fetch Full day reservations (where right_time_id is a valid ID, not null)
          const fullDayRightTime = await RightTimeModel.findOne({
            where: {
              name: 'Full day',
              lang: lang,
            },
          });

          // If Full day right time exists, fetch the corresponding reservations
          if (fullDayRightTime) {
            const fullDayReservations = await Reservations_Chalets.findAll({
              where: {
                lang: lang,
                chalet_id:chalet_id,
                right_time_id: fullDayRightTime.id, // Use Full day's right_time_id
              },
            });
            reservations = [...reservations, ...fullDayReservations];
            fullDayAdded = true; // Mark Full day as added
          }
        }
      } else {
        // Fetch the corresponding right time (Morning or Evening)
        const rightTime = await RightTimeModel.findOne({
          where: {
            name: period,
            lang: lang,
          },
        });

        // If the right time (Morning or Evening) is found, fetch the corresponding reservations
        if (rightTime) {
          const timeReservations = await Reservations_Chalets.findAll({
            where: {
              lang: lang,
              chalet_id:chalet_id,
              right_time_id: rightTime.id,
            },
          });
          reservations = [...reservations, ...timeReservations];
        }
      }

    }

    // Step 2: Return the combined results
    res.json({
      rightTime: name,
      reservations: reservations,
    });


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
      message: lang === 'en' ? 'Failed to fetch reservations' : 'فشل في جلب الحجوزات',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });

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
