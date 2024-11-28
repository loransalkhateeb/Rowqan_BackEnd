const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Chalet = sequelize.define('Chalet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  price: {
    type: DataTypes.FLOAT, 
    allowNull: false, 
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  description: {
    type: DataTypes.TEXT, 
    allowNull: false,
  },
  number_of_persons: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false, 
});

module.exports = Chalet;
