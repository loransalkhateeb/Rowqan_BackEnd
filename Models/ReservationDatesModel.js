const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');


const ReservationDates = sequelize.define('ReservationDates', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,  
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,  
});

module.exports = ReservationDates;
