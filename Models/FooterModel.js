const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const FooterIcons = require('../Models/FooterIcons')
const Footer = sequelize.define('Footer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
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


Footer.hasMany(FooterIcons, { foreignKey: 'footer_id', onDelete: 'CASCADE' });
FooterIcons.belongsTo(Footer, { foreignKey: 'footer_id' });
module.exports = Footer;
