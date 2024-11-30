const Types_Events = require('../Models/TypesEventsModel');

exports.createEventType = async (req, res) => {
  try {
    const { event_type, lang } = req.body;

    if (!event_type || !lang) {
      return res.status(400).json({ error: 'Event type and language are required' });
    }

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en".' });
    }

    const newEventType = await Types_Events.create({
      event_type,
      lang,
    });

    res.status(201).json({
      message: 'Event type created successfully',
      event_type: newEventType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event type' });
  }
};

exports.getAllEventTypes = async (req, res) => {
  try {
    const { lang } = req.query;

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const whereClause = lang ? { lang } : {};
    const eventTypes = await Types_Events.findAll({
      where: whereClause,
    });

    if (!eventTypes.length) {
      return res.status(404).json({ error: 'No event types found' });
    }

    res.status(200).json({ eventTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
};

exports.getEventTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
      whereClause.lang = lang;
    }

    const eventType = await Types_Events.findOne({
      where: whereClause,
    });

    if (!eventType) {
      return res.status(404).json({ error: `Event type with id ${id} and language ${lang || 'not provided'} not found` });
    }

    res.status(200).json({ eventType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event type' });
  }
};

exports.updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_type, lang } = req.body;

    const eventType = await Types_Events.findByPk(id);

    if (!eventType) {
      return res.status(404).json({ error: `Event type with id ${id} not found` });
    }

    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    eventType.event_type = event_type || eventType.event_type;
    eventType.lang = lang || eventType.lang;

    await eventType.save();

    res.status(200).json({ message: 'Event type updated successfully', eventType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event type' });
  }
};

exports.deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    const whereClause = { id };
    if (lang) {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language' });
      }
      whereClause.lang = lang;
    }

    const eventType = await Types_Events.findOne({
      where: whereClause,
    });

    if (!eventType) {
      return res.status(404).json({ error: `Event type with id ${id} and language ${lang || 'not provided'} not found` });
    }

    await eventType.destroy();

    res.status(200).json({ message: 'Event type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event type' });
  }
};
