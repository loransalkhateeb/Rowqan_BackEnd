const  Sub_Events  = require('../Models/SubEventsModel');
const  Types_Events  = require('../Models/TypesEventsModel');  


exports.createSubEvent = async (req, res) => {
  try {
    const { title, date, time, lang, event_id } = req.body;
    const image = req.file ? req.file.filename : null;


    if (!title || !date || !time || !lang || !event_id || !image) {
      return res.status(400).json({ error: 'All fields (title, date, time, lang, event_id, and image) are required.' });
    }


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages are "ar" and "en".' });
    }


    const event = await Types_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${event_id} not found.` });
    }


    const subEvent = await Sub_Events.create({
      title,
      image,
      date,
      time,
      lang,
      event_id,
    });

    res.status(201).json({
      message: 'Sub Event created successfully',
      sub_event: subEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sub event' });
  }
};




exports.getSubEventsById = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      const subevents = await Sub_Events.findOne({ where: { id, lang } });
  
      if (!subevents) {
        return res.status(404).json({ error: `subevents with id ${id} and language ${lang} not found` });
      }

      res.status(200).json({ subevents });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch subevents' });
    }
  };
  



exports.getAllSubEvents = async (req, res) => {
    try {
      const { lang } = req.params;  
  
      const sub_events = await Sub_Events.findAll({ where: { lang } });
  
      if (!sub_events.length) {
        return res.status(404).json({ error: 'No Sub_Events found for this language' });
      }
  
      res.status(200).json(sub_events );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve sub_events' });
    }
  };








  
  exports.getSubEventsByEventId = async (req, res) => {
    try {
      const { event_id, lang } = req.params;
  
      const event = await Types_Events.findOne({ where: { id: event_id, lang } });
      
      if (!event) {
        return res.status(404).json({ error: `Event with ID ${event_id} and language ${lang} not found.` });
      }
  
   
      const subEvents = await Sub_Events.findAll({
        where: { event_id },
        include: {
          model: Types_Events,
          where: { id: event_id, lang },  
        },
      });
 
      if (subEvents.length === 0) {
        return res.status(404).json({ error: 'No sub events found for this event and language.' });
      }
  
      res.status(200).json(
      subEvents,
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve sub events' });
    }
  };
  


exports.updateSubEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, lang, event_id } = req.body;
    const image = req.file ? req.file.filename : null;


    const subEvent = await Sub_Events.findByPk(id);
    if (!subEvent) {
      return res.status(404).json({ error: `Sub Event with ID ${id} not found.` });
    }


    const event = await Types_Events.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: `Event with ID ${event_id} not found.` });
    }

    subEvent.title = title || subEvent.title;
    subEvent.date = date || subEvent.date;
    subEvent.time = time || subEvent.time;
    subEvent.lang = lang || subEvent.lang;
    subEvent.event_id = event_id || subEvent.event_id;
    subEvent.image = image || subEvent.image;

    await subEvent.save();

    res.status(200).json({
      message: 'Sub Event updated successfully',
      sub_event: subEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update sub event' });
  }
};








exports.deleteSubEvent = async (req, res) => {
  try {
    const { id,lang } = req.params;


    const subEvent = await Sub_Events.findOne({ where: { id, lang } });
    if (!subEvent) {
      return res.status(404).json({ error: `Sub Event with ID ${id} not found.` });
    }


    await subEvent.destroy();

    res.status(200).json({ message: 'Sub Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete sub event' });
  }
};
