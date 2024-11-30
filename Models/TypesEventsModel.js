const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

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

module.exports = Types_Events;
