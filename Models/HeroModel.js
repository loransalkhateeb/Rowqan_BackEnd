const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');  

const Hero = sequelize.define('Hero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,  
    allowNull: false,  
  },
  description: {
    type: DataTypes.TEXT, 
    allowNull: true, 
  },
  title_btn: {
    type: DataTypes.STRING, 
    allowNull: true,  
  },
  image: {
    type: DataTypes.STRING, 
    allowNull: true,  
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,  
  },
}, {
  timestamps: false, 
});

module.exports = Hero;
