const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const categories_lands_model = require('../Models/CategoriesLandsModel'); 
const User = require('./UsersModel');


const Reservation_Lands = sequelize.define('Reservation_Lands', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
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


categories_lands_model.hasOne(Reservation_Lands, { foreignKey: 'available_land_id' });
Reservation_Lands.belongsTo(categories_lands_model, { foreignKey: 'available_land_id' });

User.hasMany(Reservation_Lands, { foreignKey: 'user_id'});
Reservation_Lands.belongsTo(User, { foreignKey: 'user_id'});



module.exports = Reservation_Lands;
