const Hero = require('../Models/HeroModel');
const { validateInput } = require('../Utils/validateInput');
const { ErrorResponse } = require('../MiddleWares/errorHandler');

exports.createHero = async (req, res, next) => {
    try {
      const { title, description, title_btn, lang } = req.body;

     
      const { error } = validateInput({ status: title, lang });
      if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
      }

      if (!req.file) {
        return next(new ErrorResponse('Image is required', 400));
      }
  
      const image = req.file.filename;


      if (req.user.user_type_id !== 1) {
        return next(new ErrorResponse(
          lang === 'en' ? 'You are not authorized to update users' : 'أنت غير مخول لتحديث المستخدمين',
          403
        ));
      }

      const existingHero = await Hero.findOne({ where: { title, lang } });
      if (existingHero) {
        return next(new ErrorResponse('Hero with the same title and language already exists', 400));
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
      return next(new ErrorResponse('Failed to create hero', 500));
    }
};

exports.getAllHeroesByLang = async (req, res, next) => {
  try {
    const { lang } = req.params;

   
    const { error } = validateInput({ lang });
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    const heroes = await Hero.findAll({
      where: { lang },
    });

    if (heroes.length === 0) {
      return next(new ErrorResponse('No heroes found for this language', 404));
    }

    res.status(200).json(heroes);
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse('Failed to retrieve heroes', 500));
  }
};

exports.getHeroById = async (req, res, next) => {
  try {
    const { id, lang } = req.params;

    
    const { error } = validateInput({ status: id, lang });
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    const hero = await Hero.findOne({
      where: { id, lang },
    });

    if (!hero) {
      return next(new ErrorResponse('Hero not found', 404));
    }

    res.status(200).json({ hero });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse('Failed to retrieve hero', 500));
  }
};

exports.updateHero = async (req, res, next) => {
  try {
    const { id } = req.params;  
    const { title, description, title_btn, lang: newLang } = req.body;

        const { error } = validateInput({ status: title, lang: newLang });
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    const hero = await Hero.findOne({ where: { id} });

    if (!hero) {
      return next(new ErrorResponse('Hero not found', 404));
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
    return next(new ErrorResponse('Failed to update hero', 500));
  }
};

exports.deleteHero = async (req, res, next) => {
  try {
    const { id, lang } = req.params;

    
    const { error } = validateInput({ status: id, lang });
    if (error) {
      return next(new ErrorResponse(error.details[0].message, 400));
    }

    const hero = await Hero.findOne({
      where: { id, lang },
    });

    if (!hero) {
      return next(new ErrorResponse('Hero not found', 404));
    }

    await hero.destroy();
    res.status(200).json({ message: 'Hero deleted successfully' });
  } catch (error) {
    console.error(error);
    return next(new ErrorResponse('Failed to delete hero', 500));
  }
};
