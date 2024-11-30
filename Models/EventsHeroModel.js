const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Events_Hero = sequelize.define('Events_Hero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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

module.exports = Events_Hero;
