const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const PropertiesLands = sequelize.define('PropertiesLands', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  property: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING, 
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

module.exports = PropertiesLands;
