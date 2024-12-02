const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const Users_Types = sequelize.define('Users_Types', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  lang: {
    type: DataTypes.ENUM('ar', 'en'),
    allowNull: false,
  },
}, {
  timestamps: false,
});



module.exports = Users_Types;
