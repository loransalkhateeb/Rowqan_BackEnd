const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/UsersModel');
const ReservationModel = require('../Models/ReservationsModel');
const UserTypes = require('../Models/UsersTypes');
const { validateUserInput, validateAdminInput } = require('../Utils/validateInput');
require('dotenv').config();





exports.createUser = async (req, res) => {
  const { name, email, phone_number, country, password, lang, user_type_id, RepeatPassword } = req.body;

  try {
     const validationErrors = validateAdminInput(name, email, phone_number, country, password, RepeatPassword, user_type_id);
     if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
     }

     if (!['ar', 'en'].includes(lang)) {
        return res.status(400).json({
           error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
        });
     }


     const salt = bcrypt.genSaltSync(10);
     const hashedPassword = bcrypt.hashSync(password, salt);

 

    const hashedPassword = await bcrypt.hash(password, 10); 


     const newUser = await User.create({
        name,
        email,
        phone_number,
        country,
        password: hashedPassword,
        lang,
        user_type_id,
     });


     res.status(201).json({
        message: lang === 'en' ? 'User created successfully' : 'تم إنشاء المستخدم بنجاح',
        user: newUser,
     });


    


    const finalUserType = user_type_id || 2 ;



    const newUser = await User.create({
      name,
      email,
      phone_number,
      country,
      password: hashedPassword, 
      lang,

      user_type_id: finalUserType,

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
    const validationErrors = validateUserInput(name, email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

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



const secretKey = process.env.JWT_SECRET;
console.log("SECRET_KEY:", secretKey);  


exports.login = async (req, res) => {
  const { email, password, lang } = req.body;
  try {


    // Validate the language input

    if (!['ar', 'en'].includes(lang)) {
      return res.status(400).json({
        error: lang === 'en' ? 'Invalid language. Please use "ar" or "en".' : 'اللغة غير صالحة. استخدم "ar" أو "en".',
      });
    }



    // Check if the user exists

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        error: lang === 'en' ? 'User not found' : 'المستخدم غير موجود',
      });
    }



    // Verify the password

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: lang === 'en' ? 'Invalid password' : 'كلمة المرور غير صحيحة',
      });
    }


    const secretKey = process.env.JWT_SECRET;



  

    if (!secretKey) {
      console.error("JWT_SECRET is not defined in .env file.");
      return res.status(500).json({
        error: lang === 'en' ? 'Internal server error' : 'خطأ داخلي في الخادم',
      });
    }

    const token = jwt.sign(
      { id: user.id, user_type_id: user.user_type_id },
      secretKey,
      { expiresIn: '1h' }
    );

    // Generate JWT token


    // Set the cookie first before sending the response
    
    // For Production
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 24 * 60 * 60 * 1000,
    //   sameSite: "Strict",
    // });
// For Development
    res.cookie('token', token, {
      httpOnly: true, // Cookie can't be accessed from JavaScript
      maxAge: 3600000, // 1 hour expiration
      secure: false, // Set to true in production, false in development
    });
    
    return res.status(200).json({
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

    // Ensure the token cookie is cleared both server-side and client-side

    res.clearCookie('token', { 
      httpOnly: true,  
      secure: false,   // Make sure it's false in development or adjust for production
    }); 
    // res.clearCookie('token', { 
    //   httpOnly: true,  
    //   secure: true,   // Make sure it's false in development or adjust for production
    //   sameSite: 'Strict'
    // }); 

    return res.status(200).json({

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
  const { name, email, password, RepeatPassword, role_user } = req.body;

  try {

    const validationErrors = validateAdminInput(name, email, password, RepeatPassword, role_user);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }


    const hashedPassword = bcrypt.hashSync(password, 10);
    const newAdmin = await User.create({ name, email, password: hashedPassword, role_user: 'admin' });
    res.status(201).json({
      message: 'Admin created successfully',
      admin: newAdmin,
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }

};

};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  // Extract token from cookies
  const token = req.cookies['token']; // Assuming 'token' is the cookie name
  
  if (!token) {
    return res.status(403).json({ error: 'Token missing' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = decoded; // Attach decoded user info to request object
    next();
  });
};





