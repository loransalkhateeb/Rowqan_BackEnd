const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Plans = sequelize.define('Plans', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plane_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description_plan: {
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


module.exports = Plans;
