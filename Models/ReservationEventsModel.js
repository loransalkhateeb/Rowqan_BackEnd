const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Available_Events = require('../Models/AvailableEvents'); 
const plansModel = require('../Models/PlansModel')



const Reservation_Events = sequelize.define('Reservation_Events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['ar', 'en']],
    },
  },
  available_event_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Available_Events, 
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: false,
});


Available_Events.hasOne(Reservation_Events, { foreignKey: 'available_event_id' });
Reservation_Events.belongsTo(Available_Events, { foreignKey: 'available_event_id' });






module.exports = Reservation_Events;
