const Available_Events = require("../Models/AvailableEvents");
const Sub_Events = require("../Models/SubEventsModel");
const multer = require("../Config/Multer");
const { validateInput, ErrorResponse } = require('../Utils/ValidateInput');
const { client } = require("../Utils/redisClient");

exports.createAvailableEvent = async (req, res) => {
  try {
    const {
      title,
      no_people,
      price,
      rating,
      location,
      cashback,
      time,
      description,
      lang,
      sub_event_id,
    } = req.body || {};

    const image = req.file?.filename || null;

    if (!title || !no_people || !price || !rating || !location) {
      return res
        .status(400)
        .json(
          ErrorResponse("Validation failed", [
            "Title, no_people, price, rating, and location are required fields",
          ])
        );
    }

    const validationErrors = validateInput({
      title,
      no_people,
      price,
      rating,
      location,
      cashback,
      time,
      description,
      lang,
      sub_event_id,
    });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

    const subEvent = await Sub_Events.findByPk(sub_event_id);
    if (!subEvent) {
      return res
        .status(404)
        .json(
          ErrorResponse("Sub Event not found", [
            "No Sub Event found with the given sub_event_id",
          ])
        );
    }

    const newEventPromise = Available_Events.create({
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
      sub_event_id,
    });

    const cacheDeletePromises = [client.del(`availableEvents:page:1:limit:20`)];

    const [newEvent] = await Promise.all([
      newEventPromise,
      ...cacheDeletePromises,
    ]);

    await client.set(
      `availableEvent:${newEvent.id}`,
      JSON.stringify(newEvent),
      {
        EX: 3600,
      }
    );

    res.status(201).json( newEvent);
  } catch (error) {
    console.error("Error in createAvailableEvent:", error.message);
    res
      .status(500)
      .json(
        ErrorResponse("Failed to create Available Event", [
          "An internal server error occurred.",
        ])
      );
  }
};

exports.getAvailableEventsById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const cacheKey = `availableEvent:${id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for available event:", id, lang);

      return res.status(200).json(
        JSON.parse(cachedData),
      );
    }
    console.log("Cache miss for available event:", id, lang);

    const availableEvent = await Available_Events.findOne({
      attributes: [
        "id",
        "title",
        "image",
        "no_people",
        "price",
        "rating",
        "location",
        "cashback",
        "time",
        "description",
        "lang",
        "sub_event_id",
      ],
      where: { id, lang },
    });

    if (!availableEvent) {
      return res
        .status(404)
        .json(
          ErrorResponse(
            `Available Event with id ${id} and language ${lang} not found`,
            ["No event found with the given parameters"]
          )
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(availableEvent));

    return res.status(200).json(
      availableEvent,
  );
  } catch (error) {
    console.error("Error in getAvailableEventsById:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch Available Event", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.getAvailableEventsBySubEventId = async (req, res) => {
  try {
    const { sub_event_id, lang } = req.params;

    const cacheKey = `availableEvents:subEvent:${sub_event_id}:${lang}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log(
        "Cache hit for available events by sub-event:",
        sub_event_id,
        lang
      );
      return res.status(200).json(
         JSON.parse(cachedData),
      );
    }
    console.log(
      "Cache miss for available events by sub-event:",
      sub_event_id,
      lang
    );

    const availableEvents = await Available_Events.findAll({
      attributes: [
        "id",
        "title",
        "image",
        "no_people",
        "price",
        "rating",
        "location",
        "cashback",
        "time",
        "description",
        "lang",
        "sub_event_id",
      ],
      where: { sub_event_id, lang },
    });

    if (availableEvents.length === 0) {
      return res
        .status(404)
        .json(
          ErrorResponse(
            `No available events found for Sub Event with id ${sub_event_id} and language ${lang}`,
            ["No events were found for this Sub Event"]
          )
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(availableEvents));

    return res.status(200).json( availableEvents);
  } catch (error) {
    console.error("Error in getAvailableEventsBySubEventId:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch Available Events", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.updateAvailableEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      no_people,
      price,
      rating,
      location,
      cashback,
      time,
      description,
      lang,
      sub_event_id,
    } = req.body;
    const image = req.file?.filename || null;

    const validationErrors = validateInput({
      title,
      no_people,
      price,
      rating,
      location,
      cashback,
      time,
      description,
      lang,
      sub_event_id,
    });
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(ErrorResponse("Validation failed", validationErrors));
    }

    const event = await Available_Events.findByPk(id);
    if (!event) {
      return res
        .status(404)
        .json(
          ErrorResponse("Available Event not found", [
            "No event found with the given ID.",
          ])
        );
    }

    const updatedFields = {};
    if (title && title !== event.title) updatedFields.title = title;
    if (no_people && no_people !== event.no_people)
      updatedFields.no_people = no_people;
    if (price && price !== event.price) updatedFields.price = price;
    if (rating && rating !== event.rating) updatedFields.rating = rating;
    if (location && location !== event.location)
      updatedFields.location = location;
    if (cashback && cashback !== event.cashback)
      updatedFields.cashback = cashback;
    if (time && time !== event.time) updatedFields.time = time;
    if (description && description !== event.description)
      updatedFields.description = description;
    if (lang && lang !== event.lang) updatedFields.lang = lang;
    if (sub_event_id && sub_event_id !== event.sub_event_id)
      updatedFields.sub_event_id = sub_event_id;
    if (image) updatedFields.image = image;

    if (Object.keys(updatedFields).length > 0) {
      await event.update(updatedFields);
    }

    const updatedData = event.toJSON();
    const cacheKey = `availableEvent:${id}`;
    await client.setEx(cacheKey, 3600, JSON.stringify(updatedData));

    return res.status(200).json(
      updatedData,
    );
  } catch (error) {
    console.error("Error in updateAvailableEvent:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to update Available Event", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.getAvailableEventsBySubEventIdAndDate = async (req, res) => {
  try {
    const { sub_event_id, lang, date } = req.params;

    const cacheKey = `availableEvents:subEvent:${sub_event_id}:${lang}:${date}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log(
        "Cache hit for available events by sub-event and date:",
        sub_event_id,
        lang,
        date
      );
      return res.status(200).json(
        JSON.parse(cachedData));
    }
    console.log(
      "Cache miss for available events by sub-event and date:",
      sub_event_id,
      lang,
      date
    );

    const subEvent = await Sub_Events.findOne({
      where: { id: sub_event_id, lang, date },
    });

    if (!subEvent) {
      return res
        .status(404)
        .json(
          ErrorResponse("Sub Event not found", [
            "No Sub Event found with the given sub_event_id and date",
          ])
        );
    }

    const availableEvents = await Available_Events.findAll({
      attributes: [
        "id",
        "title",
        "image",
        "no_people",
        "price",
        "rating",
        "location",
        "cashback",
        "time",
        "description",
        "lang",
        "sub_event_id",
      ],
      where: { sub_event_id },
    });

    if (availableEvents.length === 0) {
      return res
        .status(404)
        .json(
          ErrorResponse(
            "No available events found for this sub event and date.",
            ["No events were found for this sub event and date"]
          )
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(availableEvents));

    return res.status(200).json(availableEvents);
  } catch (error) {
    console.error("Error in getAvailableEventsBySubEventIdAndDate:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch Available Events", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.getAvailableEventsBySubDateOnly = async (req, res) => {
  try {
    const { lang, date } = req.params;

    const cacheKey = `availableEvents:subEvent:${lang}:${date}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log(
        "Cache hit for available events by lang and date:",
        lang,
        date
      );
      return res.status(200).json( JSON.parse(cachedData));
    }
    console.log(
      "Cache miss for available events by lang and date:",
      lang,
      date
    );

    const subEvent = await Sub_Events.findOne({
      where: { lang, date },
    });

    if (!subEvent) {
      return res
        .status(404)
        .json(
          ErrorResponse("Sub Event not found", [
            "No Sub Event found with the given lang and date",
          ])
        );
    }

    const availableEvents = await Available_Events.findAll({
      attributes: [
        "id",
        "title",
        "image",
        "no_people",
        "price",
        "rating",
        "location",
        "cashback",
        "time",
        "description",
        "lang",
        "sub_event_id",
      ],
      where: {
        sub_event_id: subEvent.id,
      },
    });

    if (availableEvents.length === 0) {
      return res
        .status(404)
        .json(
          ErrorResponse("No available events found for this sub event.", [
            "No events were found for this sub event",
          ])
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(availableEvents));

    return res.status(200).json(availableEvents);
  } catch (error) {
    console.error("Error in getAvailableEventsBySubDateOnly:", error);

    return res
      .status(500)
      .json(
        ErrorResponse("Failed to fetch Available Events", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};

exports.deleteAvailableEvent = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const [event, _] = await Promise.all([
      Available_Events.findOne({ where: { id, lang } }),
      client.del(`availableEvent:${id}:${lang}`),
    ]);

    if (!event) {
      return res
        .status(404)
        .json(
           ErrorResponse("Available Event not found", [
            "No event found with the given id and language",
          ])
        );
    }

    await event.destroy();

    return res
      .status(200)
      .json({ message: "Available Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAvailableEvent:", error);

    return res
      .status(500)
      .json(
         ErrorResponse("Failed to delete Available Event", [
          "An internal server error occurred. Please try again later.",
        ])
      );
  }
};
