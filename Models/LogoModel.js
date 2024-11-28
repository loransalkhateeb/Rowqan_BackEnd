const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Logo = sequelize.define('Logo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,  
    allowNull: true,  
  },
}, {
  timestamps: false,
});

module.exports = Logo;
