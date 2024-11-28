const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const Header = sequelize.define('Header', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
  },
  header_name: {
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

module.exports = Header;
