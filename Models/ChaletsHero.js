const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const ChaletsHero = sequelize.define('ChaletsHero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
  category: {
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

module.exports = ChaletsHero;
