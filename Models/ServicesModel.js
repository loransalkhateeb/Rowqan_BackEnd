const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const Services = sequelize.define('Services', {
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
  status_service: {
    type: DataTypes.STRING,
    allowNull: false,  
    defaultValue: 'most picked',  
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,  
  },
}, {
  timestamps: false,  
});

module.exports = Services;
