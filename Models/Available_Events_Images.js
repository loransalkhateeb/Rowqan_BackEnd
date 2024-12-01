const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Available_Events_Images = sequelize.define('Available_Events_Images', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
}, {
  timestamps: false,  
});

module.exports = Available_Events_Images;
