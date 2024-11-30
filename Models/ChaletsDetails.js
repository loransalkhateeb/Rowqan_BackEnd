const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const ChaletsDetails = sequelize.define('ChaletsDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Detail_Type: {
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

module.exports = ChaletsDetails;
