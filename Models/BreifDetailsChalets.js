const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Chalet = require('../Models/ChaletsModel'); 

const BreifDetailsChalets = sequelize.define('BreifDetailsChalets', {
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

module.exports = BreifDetailsChalets;
