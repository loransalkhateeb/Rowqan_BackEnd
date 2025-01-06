const Users_Types = require('../Models/UsersTypes');
const User = require('../Models/UsersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {client} = require('../Utils/redisClient')

exports.getAllUserTypes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const { lang } = req.params;

    
    if (lang && !['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Supported languages are "ar" and "en".',
      });
    }

    
    const cacheKey = `userTypes:page:${page}:limit:${limit}:lang:${lang || 'all'}`;
    const cachedData = await client.get(cacheKey);

    
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    
    const whereClause = lang ? { lang } : {};

    
    const userTypes = await Users_Types.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    
    if (!userTypes.length) {
      return res.status(404).json({
        error: lang === 'en' ? 'No user types found for the specified language' : 'لم يتم العثور على أنواع للمستخدمين للغة المحددة',
      });
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(userTypes));

    res.status(200).json(userTypes);
  } catch (error) {
    console.error('Error in getAllUserTypes:', error.message);
    res.status(500).json({
      error: 'Failed to fetch user types',
    });
  }
};




  exports.getUsersByType = async (req, res) => {
    const { lang, type } = req.params;
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Please use "ar" or "en".',
        });
      }
  
      const users = await User.findAll({
        include: [
          {
            model: Users_Types,
            where: { type, lang },
            attributes: ['id', 'type', 'lang'],
          },
        ],
      });
  
      if (!users.length) {
        return res.status(404).json({
          error: lang === 'en' 
            ? 'No users found for the specified type' 
            : 'لم يتم العثور على مستخدمين للنوع المحدد',
        });
      }
  
      res.status(200).json(
        users,
      );
    } catch (error) {
      console.error('Error fetching users by type:', error);
      res.status(500).json({
        error: lang === 'en' 
          ? 'Failed to fetch users' 
          : 'فشل في جلب المستخدمين',
      });
    }
  };





  exports.getChaletOwnerById = async (req, res) => {
    const { id, lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
        });
      }
  

      const user = await User.findOne({
        where: { id },
        include: [
          {
            model: Users_Types,
            where: { type: 'chalets_owners', lang },
          },
        ],
      });
  
      if (!user) {
        return res.status(404).json({
          error: lang === 'en' ? 'Chalet owner not found' : 'مالك الشاليه غير موجود',
        });
      }
  
      res.status(200).json(
        user,
      );
    } catch (error) {
      console.error('Error fetching chalet owner by ID:', error);
      res.status(500).json({
        error: lang === 'en' ? 'Failed to fetch chalet owner' : 'فشل في جلب مالك الشاليه',
      });
    }
  };
  



  exports.getEventOwnerById = async (req, res) => {
    const { id, lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
        });
      }
  

      const user = await User.findOne({
        where: { id },
        include: [
          {
            model: Users_Types,
            where: { type: 'events_owners', lang },
          },
        ],
      });
  
      if (!user) {
        return res.status(404).json({
          error: lang === 'en' ? 'Event owner not found' : 'مالك الشاليه غير موجود',
        });
      }
  
      res.status(200).json(
        user,
      );
    } catch (error) {
      console.error('Error fetching chalet owner by ID:', error);
      res.status(500).json({
        error: lang === 'en' ? 'Failed to fetch Event owner' : 'فشل في جلب مالك الشاليه',
      });
    }
  };





  exports.getLandOwnerById = async (req, res) => {
    const { id, lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
        });
      }
  

      const user = await User.findOne({
        where: { id },
        include: [
          {
            model: Users_Types,
            where: { type: 'lands_owners', lang },
          },
        ],
      });
  
      if (!user) {
        return res.status(404).json({
          error: lang === 'en' ? 'Land owner not found' : 'مالك الشاليه غير موجود',
        });
      }
  
      res.status(200).json(
       
        user,
      );
    } catch (error) {
      console.error('Error fetching Land owner by ID:', error);
      res.status(500).json({
        error: lang === 'en' ? 'Failed to fetch Land owner' : 'فشل في جلب مالك الشاليه',
      });
    }
  };





  exports.getChaletOwners = async (req, res) => {
    const { lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Please use "ar" or "en".',
        });
      }
      const users = await User.findAll({
        include: [
          {
            model: Users_Types,
            where: { type: 'chalets_owners', lang },
            attributes: ['id', 'type', 'lang'],
          },
        ],
      });
  
      if (!users.length) {
        return res.status(404).json({
          error: lang === 'en' 
            ? 'No chalet owners found' 
            : 'لم يتم العثور على مالكي الشاليهات',
        });
      }
  
      res.status(200).json(
        users,
      );
    } catch (error) {
      console.error('Error fetching chalet owners:', error);
      res.status(500).json({
        error: lang === 'en' 
          ? 'Failed to fetch chalet owners' 
          : 'فشل في جلب مالكي الشاليهات',
      });
    }
  };
  




  exports.getEventOwners = async (req, res) => {
    const { lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Please use "ar" or "en".',
        });
      }
  

      const users = await User.findAll({
        include: [
          {
            model: Users_Types,
            where: { type: 'events_owners', lang },
            attributes: ['id', 'type', 'lang'],
          },
        ],
      });
  
      if (!users.length) {
        return res.status(404).json({
          error: lang === 'en' 
            ? 'No Event owners found' 
            : 'لم يتم العثور على مالكي الشاليهات',
        });
      }
  
      res.status(200).json(
        users,
      );
    } catch (error) {
      console.error('Error fetching Event owners:', error);
      res.status(500).json({
        error: lang === 'en' 
          ? 'Failed to fetch Event owners' 
          : 'فشل في جلب مالكي الشاليهات',
      });
    }
  };
  
  

  exports.getLandOwners = async (req, res) => {
    const { lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Please use "ar" or "en".',
        });
      }
  

      const users = await User.findAll({
        include: [
          {
            model: Users_Types,
            where: { type: 'lands_owners', lang },
            attributes: ['id', 'type', 'lang'],
          },
        ],
      });
  
      if (!users.length) {
        return res.status(404).json({
          error: lang === 'en' 
            ? 'No Land owners found' 
            : 'لم يتم العثور على مالكي الشاليهات',
        });
      }
  
      res.status(200).json(
        users,
      );
    } catch (error) {
      console.error('Error fetching Land owners:', error);
      res.status(500).json({
        error: lang === 'en' 
          ? 'Failed to fetch Land owners' 
          : 'فشل في جلب مالكي الشاليهات',
      });
    }
  };


  exports.getUserTypeById = async (req, res) => {
    const { id, lang } = req.params;
  
    try {
      if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Please use "ar" or "en".',
        });
      }

      const userType = await Users_Types.findOne({
        where: { id, lang },
        include: {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      });
  
      if (!userType) {
        return res.status(404).json({
          error: lang === 'en' ? 'User Type not found' : 'نوع المستخدم غير موجود',
        });
      }
  
      res.status(200).json(
        userType,
      );
    } catch (error) {
      console.error('Error fetching user type:', error);
      res.status(500).json({
        error: lang === 'en' ? 'Failed to fetch user type' : 'فشل في جلب نوع المستخدم',
      });
    }
  };
  

exports.createUserType = async (req, res) => {
  const { type, lang } = req.body;

  if (!['ar', 'en'].includes(lang)) {
    return res.status(400).json({
      error: lang === 'en' ? 'Invalid language. Use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
    });
  }

  try {
    const newUserType = await Users_Types.create({ type, lang });
    res.status(201).json(
       newUserType,
    );
  } catch (error) {
    console.error('Error creating user type:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to create user type' : 'فشل في إنشاء نوع المستخدم',
    });
  }
};


exports.updateUserType = async (req, res) => {
  const { id } = req.params;
  const { type, lang } = req.body;

  if (lang && !['ar', 'en'].includes(lang)) {
    return res.status(400).json({
      error: lang === 'en' ? 'Invalid language. Use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
    });
  }

  try {
    const userType = await Users_Types.findByPk(id);

    if (!userType) {
      return res.status(404).json({
        error: lang === 'en' ? 'User Type not found' : 'نوع المستخدم غير موجود',
      });
    }

    await userType.update({ type, lang });
    res.status(200).json(
      userType,
    );
  } catch (error) {
    console.error('Error updating user type:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to update user type' : 'فشل في تحديث نوع المستخدم',
    });
  }
};


exports.deleteUserType = async (req, res) => {
  const { id,lang } = req.params;

  try {
    const userType = await Users_Types.findOne({
        where: { id, lang },
    });

    if (!userType) {
      return res.status(404).json({
        error: lang === 'en' ? 'User Type not found' : 'نوع المستخدم غير موجود',
      });
    }

    await userType.destroy();
    res.status(200).json({
      message: lang === 'en' ? 'User Type deleted successfully' : 'تم حذف نوع المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error deleting user type:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete user type' : 'فشل في حذف نوع المستخدم',
    });
  }
};






exports.updateChaletOwner = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, country, password,lang, user_type_id } = req.body;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }

    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Chalet owner not found' : 'مالك الشاليه غير موجود',
      });
    }


    if (user_type_id) {
      const validUserType = await Users_Types.findOne({ where: { id: user_type_id, lang } });
      if (!validUserType) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid user type ID' : 'معرف نوع المستخدم غير صالح',
        });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
      country: country || user.country,
      password: password ? await bcrypt.hash(password, 10) : user.password,
      lang: lang || user.lang,
      user_type_id: user_type_id || user.user_type_id,
    });

    res.status(200).json(
      user,
    );
  } catch (error) {
    console.error('Error updating chalet owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to update chalet owner' : 'فشل في تحديث مالك الشاليه',
    });
  }
};




exports.updateEventsOwner = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, country, password,lang,user_type_id } = req.body;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }


    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Event owner not found' : 'مالك الشاليه غير موجود',
      });
    }

    if (user_type_id) {
      const validUserType = await Users_Types.findOne({ where: { id: user_type_id, lang } });
      if (!validUserType) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid user type ID' : 'معرف نوع المستخدم غير صالح',
        });
      }
    }
  
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
      country: country || user.country,
      password: password ? await bcrypt.hash(password, 10) : user.password,
      user_type_id: user_type_id || user.user_type_id,
    });

    res.status(200).json(
      user,
    );
  } catch (error) {
    console.error('Error updating Event owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to update Event owner' : 'فشل في تحديث مالك الشاليه',
    });
  }
};




exports.updateLandsOwner = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, country, password,lang,user_type_id } = req.body;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }


    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Land owner not found' : 'مالك الشاليه غير موجود',
      });
    }



    if (user_type_id) {
      const validUserType = await Users_Types.findOne({ where: { id: user_type_id, lang } });
      if (!validUserType) {
        return res.status(400).json({
          error: lang === 'en' ? 'Invalid user type ID' : 'معرف نوع المستخدم غير صالح',
        });
      }
    }
    


    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
      country: country || user.country,
      password: password ? await bcrypt.hash(password, 10) : user.password,
      user_type_id: user_type_id || user.user_type_id,
    });

    res.status(200).json(
      user,
    );
  } catch (error) {
    console.error('Error updating Land owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to update Land owner' : 'فشل في تحديث مالك الشاليه',
    });
  }
};

exports.deleteChaletOwner = async (req, res) => {
  const { id, lang } = req.params;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }

 
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Users_Types,
          where: { type: 'chalets_owners', lang },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Chalet owner not found' : 'مالك الشاليه غير موجود',
      });
    }

    await user.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Chalet owner deleted successfully' : 'تم حذف مالك الشاليه بنجاح',
    });
  } catch (error) {
    console.error('Error deleting chalet owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete chalet owner' : 'فشل في حذف مالك الشاليه',
    });
  }
};




exports.deleteEventOwner = async (req, res) => {
  const { id, lang } = req.params;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }

 
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Users_Types,
          where: { type: 'events_owners', lang },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Event owner not found' : 'مالك الشاليه غير موجود',
      });
    }

    await user.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Event owner deleted successfully' : 'تم حذف مالك الشاليه بنجاح',
    });
  } catch (error) {
    console.error('Error deleting chalet owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete Event owner' : 'فشل في حذف مالك الشاليه',
    });
  }
};




exports.deleteLandOwner = async (req, res) => {
  const { id, lang } = req.params;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }

 
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Users_Types,
          where: { type: 'lands_owners', lang },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'Land owner not found' : 'مالك الشاليه غير موجود',
      });
    }

    await user.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'Land owner deleted successfully' : 'تم حذف مالك الشاليه بنجاح',
    });
  } catch (error) {
    console.error('Error deleting Land owner:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete Land owner' : 'فشل في حذف مالك الشاليه',
    });
  }
};
