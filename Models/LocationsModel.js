const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
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

module.exports = Location;
