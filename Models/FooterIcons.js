const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Footer = require('./FooterModel');

const FooterIcons = sequelize.define('FooterIcons', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  icon: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  link_to: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
}, {
  timestamps: false,
});



module.exports = FooterIcons;
