const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Available_Events = require('../Models/AvailableEvents')


const Sub_Events = sequelize.define('Sub_Events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
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
}, {
  timestamps: false,
});


Sub_Events.hasMany(Available_Events, { foreignKey: 'sub_event_id', onDelete: 'CASCADE' });
Available_Events.belongsTo(Sub_Events, { foreignKey: 'sub_event_id' });




module.exports = Sub_Events;
