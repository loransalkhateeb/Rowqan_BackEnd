const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const ReservationModel = require('../Models/ReservationsModel'); 

const Cashback = sequelize.define('Cashback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cashback_amount: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
    defaultValue: 0,
  },
  
}, {
  timestamps: false,
});




module.exports = Cashback;
