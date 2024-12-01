const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 
const ReservationModel = require('../Models/ReservationsModel')


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_user: {
    type: DataTypes.ENUM('admin', 'user','superAdmin'),
    defaultValue: 'user',
    allowNull: false,
  },
  lang: {
    type: DataTypes.ENUM('ar', 'en'),
    allowNull: false,  
  },
}, {
  timestamps: false,
});

User.hasMany(ReservationModel, { foreignKey: 'User_id' });
ReservationModel.belongsTo(User, { foreignKey: 'User_id' });




module.exports = User;
