const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/UsersModel');





exports.signup = async (req, res) => {
    try {
      const { name, email, phone_number, country, password, RepeatPassword, role_user, lang } = req.body;
  
      if (password !== RepeatPassword) {
        return res.status(400).json({ error: 'Password and Repeat Password do not match' });
      }
  
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds); 
  
      const newUser = await User.create({
        name,
        email,
        phone_number,
        country,
        password: hashedPassword, 
        role_user,
        lang
      });
  
      const { password: _, ...userWithoutPassword } = newUser.toJSON();
  
      res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to sign up user' });
    }
  };
  


exports.logout = (req, res) => {
  try {

    res.clearCookie('token', { httpOnly: true, secure: true });  
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log out' });
  }
};




exports.createAdmin = async (req, res) => {
    try {
      const { name, email, phone_number, country, password, RepeatPassword, role_user, lang } = req.body;
  
      if (password !== RepeatPassword) {
        return res.status(400).json({ error: 'Password and Repeat Password do not match' });
      }
  
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      if (role_user !== 'admin') {
        return res.status(400).json({ error: 'Role must be admin to create an admin user' });
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
        lang
      });

      const { password: _, ...adminWithoutPassword } = newAdmin.toJSON();
  
      res.status(201).json({ message: 'Admin created successfully', user: adminWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  };
  



exports.getAllUsers = async (req, res) => {
  try {
    const { lang } = req.params;

    const users = await User.findAll({
      where: { lang },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    const user = await User.findOne({
      where: { id, lang },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


exports.updateUser = async (req, res) => {
    try {
      const { id, lang } = req.params;
      const { name, email, phone_number, country, role_user, password } = req.body;
  
  
      const user = await User.findOne({ where: { id, lang } });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  

      user.name = name || user.name;
      user.email = email || user.email;
      user.phone_number = phone_number || user.phone_number;
      user.country = country || user.country;
      user.role_user = role_user || user.role_user;
  

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
  
 
      await user.save();
  
      const { password: _, ...updatedUser } = user.get({ plain: true });
  
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  };




exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role_user }, 'secret_key', { expiresIn: '1h' });


    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); 
    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};






