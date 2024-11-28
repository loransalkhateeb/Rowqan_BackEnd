const Chalet = require('../Models/ChaletsModel');

exports.createChalet = async (req, res) => {
  try {
    const { title, price, location, status, description, number_of_persons, lang } = req.body;


    if (!req.file) {
      return res.status(400).json({ error: 'The Image is required' });
    }

    if (!title || !price || !location || !status || !description || !number_of_persons || !lang) {
      return res.status(400).json({ error: 'All fields are required' });
    }


    const image = req.file.filename;


    const newChalet = await Chalet.create({
      image,
      title,
      price,
      location,
      status,
      description,
      number_of_persons,
      lang,
    });

    res.status(201).json({
      message: 'The chalets created Successfully',
      chalet: newChalet,
    });
  } catch (error) {
    console.error('Error To created the chalets:', error);
    res.status(500).json({ error: 'Faild to create the chelts' });
  }
};

exports.updateChalet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, location, status, description, number_of_persons, lang } = req.body;


    const chalet = await Chalet.findOne({ where: { id } });

    if (!chalet) {
      return res.status(404).json({ error: 'The chalets does not find' });
    }

 
    chalet.title = title || chalet.title;
    chalet.price = price || chalet.price;
    chalet.location = location || chalet.location;
    chalet.status = status || chalet.status;
    chalet.description = description || chalet.description;
    chalet.number_of_persons = number_of_persons || chalet.number_of_persons;
    chalet.lang = lang || chalet.lang;

   
    if (req.file) {
      chalet.image = req.file.filename;
    }

    await chalet.save();

    res.status(200).json({
      message: 'The  chalet was successfully updated',
      chalet,
    });
  } catch (error) {
    console.error('Error To Update The chalets:', error);
    res.status(500).json({ error: 'Faild to updated the chalets' });
  }
};

exports.getChaletById = async (req, res) => {
  try {
    const { id, lang } = req.params;

   
    if (!lang) {
      return res.status(400).json({ error: 'The Language is required' });
    }

    const chalet = await Chalet.findOne({ where: { id, lang } });

    if (!chalet) {
      return res.status(404).json({ error: 'The chalets does not find' });
    }

    res.status(200).json({ chalet });
  } catch (error) {
    console.error('Error of the get the chalets:', error);
    res.status(500).json({ error: 'Faild to get the chalets' });
  }
};

exports.getAllChalets = async (req, res) => {
  try {
    const { lang } = req.params;

   
    if (!lang) {
      return res.status(400).json({ error: 'the Language is required' });
    }


    const chalets = await Chalet.findAll({ where: { lang } });

    if (chalets.length === 0) {
      return res.status(404).json({ error: 'does not find the chalets for the sepecfic language' });
    }

    res.status(200).json({ chalets });
  } catch (error) {
    console.error('Error to fetching the chelts :', error);
    res.status(500).json({ error: 'Faild to fetch the chalets' });
  }
};

exports.deleteChalet = async (req, res) => {
  try {
    const { id } = req.params;

    const chalet = await Chalet.findByPk(id);

    if (!chalet) {
      return res.status(404).json({ error: 'The Chalets has not find' });
    }

    await chalet.destroy();

    res.status(200).json({ message: 'Chalets deleted Successfully' });
  } catch (error) {
    console.error('Error to deleted the chalets:', error);
    res.status(500).json({ error: 'Error to delete the chalets' });
  }
};
