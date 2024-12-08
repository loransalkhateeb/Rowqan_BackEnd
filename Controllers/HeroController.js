const Hero = require('../Models/HeroModel');  



exports.createHero = async (req, res) => {
    try {
      const { title, description, title_btn, lang } = req.body;

      if (!title || !lang) {
        return res.status(400).json({ error: 'Title and language are required' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }
      
      const image = req.file.filename;
  

      const existingHero = await Hero.findOne({ where: { title, lang } });
      if (existingHero) {
        return res.status(400).json({ error: 'Hero with the same title and language already exists' });
      }

      const newHero = await Hero.create({
        title,
        description,
        title_btn,
        image, 
        lang,
      });
  
      res.status(201).json({
        message: 'Hero created successfully',
        hero: newHero,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create hero' });
    }
  };
  

exports.getAllHeroesByLang = async (req, res) => {
  try {
    const { lang } = req.params;


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const heroes = await Hero.findAll({
      where: { lang },
    });

    if (heroes.length === 0) {
      return res.status(404).json({ error: 'No heroes found for this language' });
    }

    res.status(200).json( heroes );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve heroes' });
  }
};


exports.getHeroById = async (req, res) => {
  try {
    const { id, lang } = req.params;


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const hero = await Hero.findOne({
      where: { id, lang },
    });

    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    res.status(200).json({ hero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve hero' });
  }
};

exports.updateHero = async (req, res) => {
    try {
      const { id } = req.params;  
      const { title, description, title_btn, lang: newLang } = req.body;  
  
 
      const hero = await Hero.findOne({ where: { id} });
  
      if (!hero) {
        return res.status(404).json({ error: 'Hero not found' });
      }

      hero.title = title || hero.title;
      hero.description = description || hero.description;
      hero.title_btn = title_btn || hero.title_btn;
      hero.lang = newLang;  
  
  
      if (req.file) {
        hero.image = req.file.filename;  
      }
  
      console.log('After Update:', hero);
    
      await hero.save();
  
 
      res.status(200).json({ message: 'Hero updated successfully', hero });
    } catch (error) {
      console.error('Error updating hero:', error);
      res.status(500).json({ error: 'Failed to update hero' });
    }
  };
  
  


exports.deleteHero = async (req, res) => {
  try {
    const { id, lang } = req.params;


    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    const hero = await Hero.findOne({
      where: { id, lang },
    });

    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }


    await hero.destroy();

    res.status(200).json({ message: 'Hero deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete hero' });
  }
};
