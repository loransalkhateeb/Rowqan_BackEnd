const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const User = require('../Models/UsersModel');
const Chalet = require('../Models/ChaletsModel');
const RightTime = require('../Models/RightTimeModel');

const Reservations_Chalets = sequelize.define('Reservations_Chalets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  initial_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,  
  },
  reserve_price:{
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
  cashback: {
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,  
  },
  lang: {
    type: DataTypes.ENUM('ar', 'en'),
    allowNull: false, 
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,  
  },
  additional_visitors: {
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
  number_of_days: {
    type: DataTypes.INTEGER,
    allowNull: false,  
  },
  remaining_amount: {  
    type: DataTypes.FLOAT,
    allowNull: true, 
  },
}, {
  tableName: 'Reservations_Chalets',
  timestamps: false,
});


User.hasMany(Reservations_Chalets, { foreignKey: 'user_id', as: 'reservations' });
Reservations_Chalets.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


Chalet.hasMany(Reservations_Chalets, { foreignKey: 'chalet_id', as: 'reservations' });
Reservations_Chalets.belongsTo(Chalet, { foreignKey: 'chalet_id', as: 'chalet' });


RightTime.hasMany(Reservations_Chalets, { foreignKey: 'right_time_id', as: 'reservations' });
Reservations_Chalets.belongsTo(RightTime, { foreignKey: 'right_time_id', as: 'rightTime' });



module.exports = Reservations_Chalets;
