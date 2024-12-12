const { DataTypes } = require("sequelize");
const sequelize = require("../Config/dbConnect");
const User=require('../Models/UsersModel')
const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User", 
        key: "id",
      },
    },
    lang:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    reserved_balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    cashback_balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);



User.hasMany(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });


Wallet.associate = (models) => {
  Wallet.belongsTo(models.UsersModel, {
    foreignKey: "user_id",
    as: "User",  // Alias for the User model
  });
};

module.exports = Wallet;
