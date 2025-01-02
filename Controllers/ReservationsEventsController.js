const Reservation_Events = require('../Models/ReservationEventsModel');
const Available_Events = require('../Models/AvailableEvents');
const User = require('../Models/UsersModel');
const Plan = require('../Models/PlansModel');
const { ErrorResponse } = require('../MiddleWares/errorHandler');
// const { client } = require('../Config/redisConfig');


exports.createReservationEvent = async (req, res) => {
  try {
    const { date, Duration, lang, price, available_event_id, user_id, plan_id } = req.body;

  
    if (!date || !Duration || !lang || !price || !available_event_id || !user_id || !plan_id) {
      return res.status(400).json(new ErrorResponse('Validation failed', ['Missing required fields']));
    }

  
    const availableEvent = await Available_Events.findByPk(available_event_id);
    if (!availableEvent) {
      return res.status(404).json(new ErrorResponse('Available Event not found', ['No event found with the given available_event_id']));
    }

   
    const newReservationEvent = await Reservation_Events.create({
      date,
      Duration,
      lang,
      price,
      available_event_id,
      user_id,
      plan_id
    });

 
    res.status(201).json(
     newReservationEvent
    );
  } catch (error) {
    console.error(error);
    res.status(500).json( ErrorResponse('Failed to create Reservation Event', ['An error occurred while creating the event']));
  }
};


exports.getReservationEventById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const cacheKey = `reservationEvent:${id}:${lang}`;


    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation event:", id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation event:", id);

    const reservationEvent = await Reservation_Events.findOne({
      where: { id, lang },
      include: [
        { model: Available_Events },
        { model: User },
        { model: Plan },
      ],
    });

    if (!reservationEvent) {
      return res.status(404).json(
        new ErrorResponse(
          lang === 'en' ? `Reservation Event with id ${id} not found` : `حدث الحجز بالمعرف ${id} غير موجود`,
          [lang === 'en' ? 'No event found with the given parameters' : 'لم يتم العثور على حدث بالحجز بالمعرف المحدد']
        )
      );
    }

    await redisClient.setex(cacheKey, 600, JSON.stringify(reservationEvent));

    return res.status(200).json(
      reservationEvent,
    );
  } catch (error) {
    console.error("Error in getReservationEventById:", error);

    return res.status(500).json(
      new ErrorResponse(
        lang === 'en' ? 'Failed to fetch Reservation Event' : 'فشل في استرجاع حدث الحجز',
        [lang === 'en' ? 'An internal server error occurred. Please try again later.' : 'حدث خطأ داخلي. يرجى المحاولة لاحقًا.']
      )
    );
  }
};


exports.getAllReservationEvents = async (req, res) => {
  try {
    const { lang } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const cacheKey = `reservationEvents:lang:${lang}:page:${page}:limit:${limit}`;
    
   
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation events:", lang, page, limit);
      return res.status(200).json(
       JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation events:", lang, page, limit);

   
    const reservationEvents = await Reservation_Events.findAll({
      where: { lang },
      include: [
        { model: Available_Events },
        { model: User },
        { model: Plan }
      ],
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservation events found' : 'لا توجد أحداث حجز'
      });
    }

    
    const eventDetails = reservationEvents.map(event => ({
      date: event.date,
      status: ['Morning', 'Evening', 'Afternoon'].includes(event.Duration) ? 'Reserved' : 'Available'
    }));

    
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(eventDetails));

    return res.status(200).json(
     eventDetails,
    );
  } catch (error) {
    console.error("Error in getAllReservationEvents:", error);

    return res.status(500).json({
      message: lang === 'en' ? 'An error occurred while retrieving events' : 'حدث خطأ أثناء استرجاع الأحداث',
    });
  }
};








exports.getAllReservationEventsByAvailableId = async (req, res) => {
  try {
    const { available_event_id, lang } = req.params;

    const cacheKey = `reservationEventsByAvailableId:${available_event_id}:${lang}`;
    
    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for reservation events by available event:", available_event_id, lang);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for reservation events by available event:", available_event_id, lang);

    
    const reservationEvents = await Reservation_Events.findAll({
      where: { available_event_id },
      include: [
        { model: Available_Events, where: { id: available_event_id } },
        { model: User },
        { model: Plan }
      ]
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No reservation events found for this available event' : 'لا توجد أحداث حجز لهذا الحدث المتاح'
      });
    }

    
    const eventDetails = reservationEvents.map(event => ({
      date: event.date,
      status: ['Morning', 'Evening', 'Afternoon'].includes(event.Duration) ? 'Reserved' : 'Available'
    }));


    await client.setEx(cacheKey, 3600, JSON.stringify(eventDetails));

    return res.status(200).json(
     eventDetails,
    );
  } catch (error) {
    console.error("Error in getAllReservationEventsByAvailableId:", error);

    return res.status(500).json({
      message: lang === 'en' ? 'An error occurred while retrieving events' : 'حدث خطأ أثناء استرجاع الأحداث',
    });
  }
};







exports.getEventStatusByDate = async (req, res) => {
  try {
    const { date, available_event_id, lang } = req.params;

    const cacheKey = `eventStatus:${date}:${available_event_id}:${lang}`;
    
    
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for event status:", date, available_event_id);
      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for event status:", date, available_event_id);

   
    const reservationEvents = await Reservation_Events.findAll({
      where: { date, available_event_id },
      include: [
        { model: Available_Events, where: { id: available_event_id } }
      ]
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({
        message: lang === 'en' ? 'No events found for this date and available event' : 'لا توجد أحداث لهذا التاريخ والحدث المتاح'
      });
    }

    
    let statusData = [
      { duration: 'Morning', status: 'Available' },
      { duration: 'Afternoon', status: 'Available' },
      { duration: 'Evening', status: 'Available' }
    ];

    reservationEvents.forEach(event => {
      const duration = event.Duration.trim(); 
      const eventIndex = statusData.findIndex(status => status.duration === duration);
      if (eventIndex !== -1) {
        statusData[eventIndex].status = `${duration} Reserved`;
      }
    });

  
    await client.setEx(cacheKey, 3600, JSON.stringify(statusData));

    return res.status(200).json(
     statusData,
    );
  } catch (error) {
    console.error("Error in getEventStatusByDate:", error);

    return res.status(500).json({
      message: lang === 'en' ? 'An error occurred while retrieving the event status' : 'حدث خطأ أثناء استرجاع حالة الحدث',
    });
  }
};







exports.updateReservationEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, Duration, lang, price, available_event_id, user_id, plan_id } = req.body;

  
    if (!date || !Duration || !lang || !price || !available_event_id || !user_id || !plan_id) {
      return res.status(400).json(new ErrorResponse('Validation failed', ['Missing required fields']));
    }

   
    const availableEvent = await Available_Events.findByPk(available_event_id);
    if (!availableEvent) {
      return res.status(404).json(new ErrorResponse('Available Event not found', ['No event found with the given available_event_id']));
    }

    
    const reservationEvent = await Reservation_Events.findByPk(id);
    if (!reservationEvent) {
      return res.status(404).json(new ErrorResponse('Reservation Event not found', ['No event found with the given id']));
    }

    reservationEvent.date = date || reservationEvent.date;
    reservationEvent.Duration = Duration || reservationEvent.Duration;
    reservationEvent.lang = lang || reservationEvent.lang;
    reservationEvent.price = price || reservationEvent.price;
    reservationEvent.available_event_id = available_event_id || reservationEvent.available_event_id;
    reservationEvent.user_id = user_id || reservationEvent.user_id;
    reservationEvent.plan_id = plan_id || reservationEvent.plan_id;

    await reservationEvent.save();

    res.status(200).json(
      reservationEvent
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Reservation Event', ['An error occurred while updating the event']));
  }
};


exports.deleteReservationEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    const [reservationEvent, _] = await Promise.all([
      Reservation_Events.findByPk(id), 
      redisClient.del(`reservationEvent:${id}:${lang}`) 
    ]);

    if (!reservationEvent) {
      return res.status(404).json({
        message: lang === 'en' ? 'Reservation Event not found' : 'لم يتم العثور على الحدث'
      });
    }


    await reservationEvent.destroy();

    return res.status(200).json({
      message: lang === 'en' ? 'Reservation Event deleted successfully' : 'تم حذف الحدث بنجاح'
    });
  } catch (error) {
    console.error("Error in deleteReservationEvent:", error);

    return res.status(500).json({
      message: lang === 'en' ? 'Failed to delete Reservation Event' : 'فشل في حذف الحدث'
    });
  }
};

