const Reservation_Events  = require('../Models/ReservationEventsModel');
const Available_Events = require('../Models/AvailableEvents'); 


exports.createReservationEvent = async (req, res) => {
  try {
    const { date, time, lang, available_event_id } = req.body;


    const availableEvent = await Available_Events.findByPk(available_event_id);
    if (!availableEvent) {
      return res.status(404).json({
        error: lang === 'en' ? 'Available Event not found' : 'حدث متاح غير موجود',
      });
    }

 
    const newReservationEvent = await Reservation_Events.create({
      date,
      time,
      lang,
      available_event_id,
    });

    res.status(201).json({
      message: lang === 'en' ? 'Reservation Event created successfully' : 'تم إنشاء الحدث المحجوز بنجاح',
      reservation_event: newReservationEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Reservation Event' });
  }
};


exports.getReservationEventById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const reservationEvent = await Reservation_Events.findOne({
      where: { id },
      include: {
        model: Available_Events,
        attributes: ['id', 'title'], 
      },
    });

    if (!reservationEvent) {
      return res.status(404).json({
        error: lang === 'en' ? `Reservation Event with ID ${id} not found` : `الحدث المحجوز بالرقم ${id} غير موجود`,
      });
    }

    res.status(200).json({
      message: lang === 'en' ? 'Reservation Event retrieved successfully' : 'تم جلب الحدث المحجوز بنجاح',
      reservation_event: reservationEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Reservation Event' });
  }
};


exports.updateReservationEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, lang, available_event_id } = req.body;

 
    const reservationEvent = await Reservation_Events.findByPk(id);
    if (!reservationEvent) {
      return res.status(404).json({
        error: lang === 'en' ? `Reservation Event with ID ${id} not found` : `الحدث المحجوز بالرقم ${id} غير موجود`,
      });
    }

    
    const availableEvent = await Available_Events.findByPk(available_event_id);
    if (!availableEvent) {
      return res.status(404).json({
        error: lang === 'en' ? 'Available Event not found' : 'حدث متاح غير موجود',
      });
    }


    reservationEvent.date = date || reservationEvent.date;
    reservationEvent.time = time || reservationEvent.time;
    reservationEvent.lang = lang || reservationEvent.lang;
    reservationEvent.available_event_id = available_event_id || reservationEvent.available_event_id;

    await reservationEvent.save();

    res.status(200).json({
      message: lang === 'en' ? 'Reservation Event updated successfully' : 'تم تحديث الحدث المحجوز بنجاح',
      reservation_event: reservationEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Reservation Event' });
  }
};


exports.deleteReservationEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const reservationEvent = await Reservation_Events.findByPk(id);
    if (!reservationEvent) {
      return res.status(404).json({
        error: lang === 'en' ? `Reservation Event with ID ${id} not found` : `الحدث المحجوز بالرقم ${id} غير موجود`,
      });
    }

    await reservationEvent.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Reservation Event deleted successfully' : 'تم حذف الحدث المحجوز بنجاح',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete Reservation Event' });
  }
};


exports.getAllReservationEvents = async (req, res) => {
  try {
    const { lang } = req.query;

    const reservationEvents = await Reservation_Events.findAll({
      include: {
        model: Available_Events,
        attributes: ['id', 'title'],
      },
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({
        error: lang === 'en' ? 'No Reservation Events found' : 'لم يتم العثور على أحداث محجوزة',
      });
    }

    res.status(200).json({
      message: lang === 'en' ? 'Reservation Events retrieved successfully' : 'تم جلب الأحداث المحجوزة بنجاح',
      reservation_events: reservationEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve Reservation Events' });
  }
};
