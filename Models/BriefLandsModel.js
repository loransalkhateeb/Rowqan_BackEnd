const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const BreifEvents = sequelize.define('BreifEvents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, 
});

module.exports = BreifEvents;
