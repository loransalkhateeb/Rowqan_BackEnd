const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const StatusChalets = sequelize.define('StatusChalets', {
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
  }
}, {
  timestamps: false,  
});

module.exports = StatusChalets;
