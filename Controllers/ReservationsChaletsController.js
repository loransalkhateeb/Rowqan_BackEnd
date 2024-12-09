const Reservations_Chalets = require('../Models/Reservations_Chalets');
const Chalet = require('../Models/ChaletsModel');
const User = require('../Models/UsersModel');
const RightTimeModel = require('../Models/RightTimeModel');
const Wallet = require('../Models/WalletModel')


exports.createReservation = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
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

  
    if (!initial_amount || !date || !lang || !user_id || !chalet_id || !right_time_id) {
      return res.status(400).json({
        error: lang === 'en' 
          ? 'All required fields must be provided: initial_amount, date, lang, user_id, chalet_id, and right_time_id' 
          : 'جميع الحقول المطلوبة يجب أن تكون موجودة: initial_amount, date, lang, user_id, chalet_id, and right_time_id',
      });
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

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }

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
      user_id,
      chalet_id,
      right_time_id,
    });

  
    let wallet = await Wallet.findOne({ where: { user_id } });

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
      wallet: {
        total_balance: wallet.total_balance,
        cashback_balance: wallet.cashback_balance,
      },
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
    const {  chalet_id,lang } = req.params; 

   
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


exports.getReservationsByUserId = async (req, res) => {
  try {
    const {  user_id,lang } = req.params; 

   
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language' : 'اللغة غير صالحة',
      });
    }

   
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid chalet ID' : 'رقم الشاليه غير صحيح',
      });
    }

    
    const reservations = await Reservations_Chalets.findAll({
      where: { user_id: user_id },
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
