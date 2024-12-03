const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const PropertiesLands = require('../Models/PropertiesLandsModel')
const CategoriesImageLands = require('../Models/Categories_image_Lands')
const BreifLandsModel = require('../Models/BriefLandsModel')
const ReservationsModel = require('../Models/ReservationsModel')


const CategoriesLandsModel = sequelize.define('CategoriesLands', {
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
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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


CategoriesLandsModel.hasMany(PropertiesLands, { foreignKey: 'category_land_id' });
PropertiesLands.belongsTo(CategoriesLandsModel, { foreignKey: 'category_land_id' });




CategoriesLandsModel.hasMany(CategoriesImageLands, { foreignKey: 'category_id' });
CategoriesImageLands.belongsTo(CategoriesLandsModel, { foreignKey: 'category_id' });



CategoriesLandsModel.hasMany(BreifLandsModel, { foreignKey: 'category_id', onDelete: 'CASCADE' });
BreifLandsModel.belongsTo(CategoriesLandsModel, { foreignKey: 'category_id' });




CategoriesLandsModel.hasMany(ReservationsModel, { foreignKey: 'land_id' });
ReservationsModel.belongsTo(CategoriesLandsModel, { foreignKey: 'land_id' });


module.exports = CategoriesLandsModel;
