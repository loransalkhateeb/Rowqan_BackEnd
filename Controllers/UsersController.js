const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/UsersModel');
const ReservationModel = require('../Models/ReservationsModel');
const UserTypes = require('../Models/UsersTypes');


exports.createUser = async (req, res) => {
  const { name, email, phone_number, country, password, lang, user_type_id } = req.body;

  try {
 
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

 
    const finalUserType = user_type_id || 'User';


    const newUser = await User.create({
      name,
      email,
      phone_number,
      country,
      password: hashedPassword, 
      lang,
      user_type_id: finalUserType, 
      
    });

    res.status(201).json({
      message: lang === 'en' ? 'User created successfully' : 'تم إنشاء المستخدم بنجاح',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to create user' : 'فشل في إنشاء المستخدم',
    });
  }
};


exports.getAllUsers = async (req, res) => {
  const { lang } = req.params;
  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Please use "ar" or "en".',
      });
    }
    const users = await User.findAll({
      where: { lang },
      include: [
        {
          model: UserTypes,
          attributes: ['id', 'type'],
        },
      ],
    });

    res.status(200).json({
      message: lang === 'en' ? 'Users fetched successfully' : 'تم جلب المستخدمين بنجاح',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to fetch users' : 'فشل في جلب المستخدمين',
    });
  }
};


exports.getUserById = async (req, res) => {
  const { id, lang } = req.params;

  try {
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Please use "ar" or "en".',
      });
    }
    const user = await User.findOne({
      where: { id, lang },
      include: [
        {
          model: ReservationModel,
          attributes: ['id', 'total_amount', 'cashback_amount'],
        },
        {
          model: UserTypes,
          attributes: ['id', 'type'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }

    res.status(200).json({
      message: lang === 'en' ? 'User fetched successfully' : 'تم جلب المستخدم بنجاح',
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to fetch user' : 'فشل في جلب المستخدم',
    });
  }
};


exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number, country, password, lang, user_type_id } = req.body;

  try {
 
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }

 
    await user.update({
      name,
      email,
      phone_number,
      country,
      password,
      lang,
      user_type_id,
    });

    res.status(200).json({
      message: lang === 'en' ? 'User updated successfully' : 'تم تحديث المستخدم بنجاح',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to update user' : 'فشل في تحديث المستخدم',
    });
  }
};


exports.deleteUser = async (req, res) => {
  const { id, lang } = req.params;
  try {
    const user = await User.findOne({
      where: { id, lang },
    });
    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }


    await user.destroy();

    res.status(200).json({
      message: lang === 'en' ? 'User deleted successfully' : 'تم حذف المستخدم بنجاح',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to delete user' : 'فشل في حذف المستخدم',
    });
  }
};


exports.login = async (req, res) => {
  const { email, password, lang } = req.body;

  try {
  
    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language. Please use "ar" or "en".',
      });
    }

 
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }


    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: lang === 'en' ? 'Invalid password' : 'كلمة المرور غير صحيحة',
      });
    }

  
    const token = jwt.sign({ id: user.id, user_type_id: user.user_type_id }, 'secret_key', { expiresIn: '1h' });

    res.status(200).json({
      message: lang === 'en' ? 'Login successful' : 'تم تسجيل الدخول بنجاح',
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to login' : 'فشل في تسجيل الدخول',
    });
  }
};


exports.logout = (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true }); 
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      error: 'Failed to log out',
    });
  }
};


exports.createAdmin = async (req, res) => {
  const { name, email, phone_number, country, password, RepeatPassword, role_user, lang } = req.body;

  try {
    if (password !== RepeatPassword) {
      return res.status(400).json({
        error: lang === 'en' ? 'Password and Repeat Password do not match' : 'كلمة المرور وتكرار كلمة المرور غير متطابقتين',
      });
    }

    if (role_user !== 'admin') {
      return res.status(400).json({
        error: lang === 'en' ? 'Role must be admin to create an admin user' : 'يجب أن يكون الدور "admin" لإنشاء مستخدم أدمن',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await User.create({
      name,
      email,
      phone_number,
      country,
      password: hashedPassword,
      role_user,
      lang,
    });

    res.status(201).json({
      message: lang === 'en' ? 'Admin created successfully' : 'تم إنشاء الأدمن بنجاح',
      user: newAdmin,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      error: lang === 'en' ? 'Failed to create admin' : 'فشل في إنشاء الأدمن',
    });
  }
};
