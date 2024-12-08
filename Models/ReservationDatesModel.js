const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const ReservationDates = sequelize.define('ReservationDates', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  right_time_id: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  chalet_id: {
    type: DataTypes.INTEGER,  
    allowNull: false,
  },
}, {
  timestamps: false,  
});

module.exports = ReservationDates;
