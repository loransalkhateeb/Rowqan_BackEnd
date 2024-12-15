const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Available_Events_Images = require('../Models/Available_Events_Images')



const Available_Events = sequelize.define('Available_Events', {
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
  no_people: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2) 
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cashback: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  description: {
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


Available_Events_Images.belongsTo(Available_Events, { foreignKey: 'event_id' });
Available_Events.hasMany(Available_Events_Images, { foreignKey: 'event_id' });





module.exports = Available_Events;
