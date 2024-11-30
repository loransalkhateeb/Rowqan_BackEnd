const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const ContactUs = sequelize.define('ContactUs', {
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
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: false,  
});

module.exports = ContactUs;
