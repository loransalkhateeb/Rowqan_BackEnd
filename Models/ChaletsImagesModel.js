const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const chaletsImages = sequelize.define('ChaletsImages', {
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

module.exports = chaletsImages;
