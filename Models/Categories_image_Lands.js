const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const CategoriesImageLands = sequelize.define('CategoriesImageLands', {
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

module.exports = CategoriesImageLands;
