const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Users = require('../Models/UsersModel');


const Messages = sequelize.define('Messages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: { 
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


Users.hasMany(Messages, { foreignKey: 'User_Id', onDelete: 'CASCADE' }); 
Messages.belongsTo(Users, { foreignKey: 'User_Id', onDelete: 'CASCADE' }); 
module.exports = Messages;
