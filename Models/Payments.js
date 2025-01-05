
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Users = require('../Models/UsersModel');
const ReservationChalets = require('../Models/Reservations_Chalets')

const Payments = sequelize.define('Payments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {  
      type: DataTypes.INTEGER,
      allowNull: true,  
  },
  }, {
    timestamps: true,
  });

  Payments.belongsTo(Users, { foreignKey: 'user_id' });
  Users.hasMany(Payments, { foreignKey: 'user_id' });


  Payments.belongsTo(ReservationChalets, { foreignKey:'reservation_id' });
  ReservationChalets.hasMany(Payments, { foreignKey:'reservation_id' });

  module.exports = Payments;

