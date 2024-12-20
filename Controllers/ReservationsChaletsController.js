const { validateInput, ErrorResponse } = require("../Utils/validateInput");
const Reservations_Chalets = require('../Models/Reservations_Chalets');
const Chalet = require('../Models/ChaletsModel');
const User = require('../Models/UsersModel');
const RightTimeModel = require('../Models/RightTimeModel');
const Wallet = require('../Models/WalletModel')
const { Op } = require('sequelize');
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
    } = req.body;


    // const inputValidation = validateInput(req.body, [
    //   'date',
    //   'lang',
    //   'user_id',
    //   'chalet_id',
    //   'right_time_id'
    // ]);
    

    // if (inputValidation.error) {
    //   return res.status(400).json(inputValidation);
    // }

    
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

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

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
      ]
    });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservations found' : 'لا توجد حجوزات',
      });
    }

    return res.status(200).json({
      message: lang === 'en' ? 'Reservations retrieved successfully' : 'تم استرجاع الحجوزات بنجاح',
      reservations: reservations.map(reservation => ({
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
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      error: 'Failed to fetch reservations',
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

    return res.status(200).json({
      message: lang === 'en' ? 'Reservation retrieved successfully' : 'تم استرجاع الحجز بنجاح',
      reservation: {
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
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({
      error: 'Failed to fetch reservation',
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
          attributes: ['id', 'time','name'], 
        }
      ]
    });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservations found for this chalet' : 'لا توجد حجوزات لهذا الشاليه',
      });
    }

    return res.status(200).json({
      message: lang === 'en' ? 'Reservations retrieved successfully' : 'تم استرجاع الحجوزات بنجاح',
      reservations: reservations.map(reservation => ({
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
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return res.status(500).json({
      error: 'Failed to fetch reservations',
    });
  }
};



exports.getAvailableTimesByDate = async (req, res) => {
  const { chalet_id, date } = req.params; // The date selected by the user
  const formattedDate = moment(date).format('YYYY-MM-DD'); // Ensure the date is in 'YYYY-MM-DD' format

  try {
    // Start and end of the selected day (handling full date range)
    const startOfDay = moment(formattedDate).startOf('day').toDate();  // 2024-12-23 00:00:00
    const endOfDay = moment(formattedDate).endOf('day').toDate();      // 2024-12-23 23:59:59

    // Find all reservations for the selected date and chalet
    const reservations = await Reservations_Chalets.findAll({
      where: {
        date: {
          [Op.gte]: startOfDay,  // Match reservations after or at the start of the day
          [Op.lt]: endOfDay,     // Match reservations before the end of the day
        },
        chalet_id: chalet_id,
      },
      include: [{
        model: RightTimeModel,
        as: 'rightTime',  // Use the alias for the rightTime relation
      }],
    });

    // Extract the reserved time slots (Morning, Evening, Full day)
    const reservedTimes = reservations.map(reservation => reservation.rightTime.name);

    // Get all time slots for this chalet (morning, evening, full day)
    const allTimeSlots = await RightTimeModel.findAll({
      where: {
        chalet_id: chalet_id,
      }
    });

    // Filter out the reserved time slots
    let availableTimeSlots = allTimeSlots.filter(slot => !reservedTimes.includes(slot.name));

    // If either Morning or Evening is reserved, exclude Full day
    if (reservedTimes.includes('Morning') || reservedTimes.includes('Evening')) {
      availableTimeSlots = availableTimeSlots.filter(slot => slot.name !== 'Full day');
    }

    // Return the available time slots
    res.json(availableTimeSlots);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};






exports.getReservationsByRightTimeName = async (req, res) => {
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

    res.status(200).json({
      message: updateData.lang === 'en' ? 'Reservation updated successfully' : 'تم تحديث الحجز بنجاح',
      reservation,
    });
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

    const reservation = await Reservations_Chalets.findByPk(id);
    if (!reservation) {
      return res.status(404).json({
        error: lang === 'en' ? 'Reservation not found' : 'الحجز غير موجود',
      });
    }

    await reservation.destroy();
    res.status(200).json({
      message: lang === 'en' ? 'Reservation deleted successfully' : 'تم حذف الحجز بنجاح',
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete reservation' : 'فشل في حذف الحجز',
    });
  }
};
