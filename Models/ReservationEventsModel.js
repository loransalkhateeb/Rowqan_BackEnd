const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Available_Events = require('../Models/AvailableEvents');
const User = require('./UsersModel');
const Plan = require('../Models/PlansModel');

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
  Duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['ar', 'en']],
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  available_event_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Available_Events,
      key: 'id',
    },
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,  
    references: {
      model: User,
      key: 'id',
    },
  },
  plan_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Plan,
      key: 'id',
    },
    allowNull: true,
  },
}, {
  timestamps: false,
});

Available_Events.hasOne(Reservation_Events, { foreignKey: 'available_event_id' });
Reservation_Events.belongsTo(Available_Events, { foreignKey: 'available_event_id' });

User.hasMany(Reservation_Events, { foreignKey: 'user_id' });
Reservation_Events.belongsTo(User, { foreignKey: 'user_id', allowNull: true }); // السماح بـ null هنا

Plan.hasMany(Reservation_Events, { foreignKey: 'plan_id' });
Reservation_Events.belongsTo(Plan, { foreignKey: 'plan_id' });

module.exports = Reservation_Events;
