const Available_Events = require('../Models/AvailableEvents');
const Sub_Events = require('../Models/SubEventsModel');
const multer = require('../Config/Multer');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');

exports.createAvailableEvent = async (req, res) => {
  try {
    const { title, no_people, price, rating, location, cashback, time, description, lang, sub_event_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const validationErrors = validateInput({ title, no_people, price, rating, location, cashback, time, description, lang, sub_event_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
    }

    const subEvent = await Sub_Events.findByPk(sub_event_id);
    if (!subEvent) {
      return res.status(404).json(new ErrorResponse('Sub Event not found', ['No Sub Event found with the given sub_event_id']));
    }

    const newEvent = await Available_Events.create({
      title,
      image,
      no_people,
      price,
      rating,
      location,
      cashback,
      time,
      description,
      lang,
      sub_event_id
    });

    res.status(201).json({
      message: 'Available Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create Available Event', ['An error occurred while creating the event']));
  }
};

exports.getAvailableEventsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const availableEvents = await Available_Events.findOne({ where: { id, lang } });

    if (!availableEvents) {
      return res.status(404).json(new ErrorResponse(`Available Event with id ${id} and language ${lang} not found`, ['No event found with the given parameters']));
    }

    res.status(200).json([availableEvents]);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch available events', ['An error occurred while fetching the events']));
  }
};

exports.getAvailableEventsBySubEventId = async (req, res) => {
  try {
    const { sub_event_id, lang } = req.params;

    const subEvent = await Sub_Events.findOne({ where: { id: sub_event_id, lang } });
    if (!subEvent) {
      return res.status(404).json(new ErrorResponse('Sub Event not found', ['No Sub Event found with the given sub_event_id']));
    }

    const availableEvents = await Available_Events.findAll({
      where: { sub_event_id },
      include: { model: Sub_Events, where: { id: sub_event_id } }
    });

    if (availableEvents.length === 0) {
      return res.status(404).json(new ErrorResponse('No available events found for this sub event.', ['No events were found for this sub event']));
    }

    res.status(200).json(availableEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Available Events', ['An error occurred while retrieving events']));
  }
};

exports.updateAvailableEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, no_people, price, rating, location, cashback, time, description, lang, sub_event_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const validationErrors = validateInput({ title, no_people, price, rating, location, cashback, time, description, lang, sub_event_id });
    if (validationErrors.length > 0) {
      return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
    }

    const event = await Available_Events.findByPk(id);
    if (!event) {
      return res.status(404).json(new ErrorResponse('Available Event not found', ['No event found with the given id']));
    }

    event.title = title || event.title;
    event.no_people = no_people || event.no_people;
    event.price = price || event.price;
    event.rating = rating || event.rating;
    event.location = location || event.location;
    event.cashback = cashback || event.cashback;
    event.time = time || event.time;
    event.description = description || event.description;
    event.lang = lang || event.lang;
    event.sub_event_id = sub_event_id || event.sub_event_id;
    event.image = image || event.image;

    await event.save();

    res.status(200).json({
      message: 'Available Event updated successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update Available Event', ['An error occurred while updating the event']));
  }
};

exports.getAvailableEventsBySubEventIdAndDate = async (req, res) => {
  try {
    const { sub_event_id, lang, date } = req.params;

    const subEvent = await Sub_Events.findOne({ where: { id: sub_event_id, lang, date } });
    if (!subEvent) {
      return res.status(404).json(new ErrorResponse('Sub Event not found', ['No Sub Event found with the given sub_event_id and date']));
    }

    const availableEvents = await Available_Events.findAll({
      where: {
        sub_event_id,
      },
      include: {
        model: Sub_Events,
        where: { id: sub_event_id }, 
      },
    });

    if (availableEvents.length === 0) {
      return res.status(404).json(new ErrorResponse('No available events found for this sub event.', ['No events were found for this sub event']));
    }

    res.status(200).json({
      message: 'Available Events retrieved successfully',
      available_events: availableEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Available Events', ['An error occurred while retrieving events']));
  }
};

exports.getAvailableEventsBySubDateOnly = async (req, res) => {
  try {
    const { lang, date } = req.params;

    const subEvent = await Sub_Events.findOne({ where: { lang, date } });
    if (!subEvent) {
      return res.status(404).json(new ErrorResponse('Sub Event not found', ['No Sub Event found with the given lang and date']));
    }

    const availableEvents = await Available_Events.findAll({
      where: {
        sub_event_id: subEvent.id,  
      },
      include: {
        model: Sub_Events,
        where: { id: subEvent.id },  
      },
    });

    if (availableEvents.length === 0) {
      return res.status(404).json(new ErrorResponse('No available events found for this sub event.', ['No events were found for this sub event']));
    }

    res.status(200).json({
      message: 'Available Events retrieved successfully',
      available_events: availableEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve Available Events', ['An error occurred while retrieving events']));
  }
};

exports.deleteAvailableEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const event = await Available_Events.findOne({ where: { id, lang } });
    if (!event) {
      return res.status(404).json(new ErrorResponse('Available Event not found', ['No event found with the given id and language']));
    }

    await event.destroy();
    res.status(200).json({ message: 'Available Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete Available Event', ['An error occurred while deleting the event']));
  }
};
