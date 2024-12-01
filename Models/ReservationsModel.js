const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const CashBack = require('../Models/CashBackModel')
const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cashback_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,  
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['ar', 'en']], 
    },
  },
}, {
  timestamps: false, 
});

Reservation.hasMany(CashBack, { foreignKey: 'reservation_id' });
CashBack.belongsTo(Reservation, { foreignKey: 'reservation_id' });

module.exports = Reservation;
