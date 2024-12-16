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

 
    res.status(201).json({
      message: 'Reservation Event created successfully',
      reservationEvent: newReservationEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create Reservation Event', ['An error occurred while creating the event']));
  }
};


exports.getReservationEventById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    
    redisClient.get(`reservationEvent:${id}:${lang}`, async (err, data) => {
      if (data) {
        return res.status(200).json(JSON.parse(data)); 
      }

     
      const reservationEvent = await Reservation_Events.findOne({
        where: { id, lang },
        include: [
          { model: Available_Events },
          { model: User },
          { model: Plan }
        ]
      });

      if (!reservationEvent) {
        return res.status(404).json(new ErrorResponse(`Reservation Event with id ${id} and language ${lang} not found`, ['No event found with the given parameters']));
      }

     
      redisClient.setex(`reservationEvent:${id}:${lang}`, 600, JSON.stringify(reservationEvent));

      res.status(200).json(reservationEvent);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch Reservation Event', ['An error occurred while fetching the event']));
  }
};


exports.getAllReservationEvents = async (req, res) => {
  try {
    const { lang } = req.params;
    const reservationEvents = await Reservation_Events.findAll({
      where: { lang },
      include: [  
        { model: Available_Events },
        { model: User },
        { model: Plan }
      ]
    });
    if (reservationEvents.length === 0) {
      return res.status(404).json({ message: 'No reservation events found' });
    }
   
    const eventDetails = reservationEvents.map(event => ({
      date: event.date,
      status: [' Mornning', ' Evenning', 'AfterNoon'].includes(event.Duration) ? 'Reserved' : 'Available'
    }));

    res.status(200).json(eventDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving events' });
  }
};







exports.getAllReservationEventsByAvailableId = async (req, res) => {
  try {
    const { available_event_id, lang } = req.params;

    const reservationEvents = await Reservation_Events.findAll({
      where: { available_event_id },
      include: [
        { model: Available_Events, where: { id: available_event_id } },
        { model: User },
        { model: Plan }
      ]
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({ message: 'No reservation events found for this available event' });
    }

    
    const eventDetails = reservationEvents.map(event => ({
      date: event.date,
      status: [' Mornning', ' Evenning', 'AfterNoon'].includes(event.Duration) ? 'Reserved' : 'Available'
    }));

    res.status(200).json(eventDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the events' });
  }
};







exports.getEventStatusByDate = async (req, res) => {
  try {
    const { date, available_event_id } = req.params;

   
    const reservationEvents = await Reservation_Events.findAll({
      where: { date, available_event_id },
      include: [
        { model: Available_Events, where: { id: available_event_id } }
      ]
    });

    if (reservationEvents.length === 0) {
      return res.status(404).json({ message: 'No events found for this date and available event' });
    }

  
    let statusData = [
      { duration: 'Mornning', status: 'Available' },
      { duration: 'Afternoon', status: 'Available' },
      { duration: 'Evenning', status: 'Available' }
    ];


    reservationEvents.forEach(event => {
      const duration = event.Duration.trim(); 
      const eventIndex = statusData.findIndex(status => status.duration === duration);
      if (eventIndex !== -1) {
        statusData[eventIndex].status = `${duration} Reserved`;
      }
    });

   
    res.status(200).json(statusData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while retrieving the event status' });
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

    res.status(200).json({
      message: 'Reservation Event updated successfully',
      reservationEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Reservation Event', ['An error occurred while updating the event']));
  }
};


exports.deleteReservationEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    redisClient.del(`reservationEvent:${id}:${lang}`, async (err, data) => {
      const reservationEvent = await Reservation_Events.findByPk(id);
      if (!reservationEvent) {
        return res.status(404).json(new ErrorResponse('Reservation Event not found', ['No event found with the given id']));
      }

      await reservationEvent.destroy();

      res.status(200).json({
        message: 'Reservation Event deleted successfully'
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete Reservation Event', ['An error occurred while deleting the event']));
  }
};
