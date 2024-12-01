const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const SubEventsModel = require('../Models/SubEventsModel')
const ReservationsModel = require('../Models/ReservationsModel')

const Types_Events = sequelize.define('Types_Events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_type: {
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
}, {
  timestamps: false, 
});


Types_Events.hasMany(SubEventsModel, { foreignKey: 'event_id', onDelete: 'CASCADE' });
SubEventsModel.belongsTo(Types_Events, { foreignKey: 'event_id' });


Types_Events.hasMany(ReservationsModel, { foreignKey: 'Event_id',onDelete: 'CASCADE' });
ReservationsModel.belongsTo(Types_Events, { foreignKey: 'Event_id' });


module.exports = Types_Events;
