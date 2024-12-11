const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Chalet = require('../Models/ChaletsModel');

const Status = sequelize.define('Statuses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
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





module.exports = Status;
