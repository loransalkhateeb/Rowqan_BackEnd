
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Chalet = require('../Models/ChaletsModel')
const AvailableEvents = require('../Models/AvailableEvents')
const Lands = require('../Models/CategoriesLandsModel')


const FeedBack = sequelize.define('FeedBack', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['ar', 'en']], 
      },
    },
    rating: {
      type: DataTypes.INTEGER, 
      allowNull: false, 
      validate: {
        min: 1, 
        max: 5, 
      },
    },
    chalet_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // يمكن أن تكون القيمة null
    },
    available_event_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // يمكن أن تكون القيمة null
    },
    land_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // يمكن أن تكون القيمة null
    }
  }, {
    timestamps: false, 
  });
  
  // العلاقات بين الجداول كما هي
  Chalet.hasMany(FeedBack, {
    foreignKey: 'chalet_id',
  });
  
  FeedBack.belongsTo(Chalet, {
    foreignKey: 'chalet_id',
  });
  
  AvailableEvents.hasMany(FeedBack, {
    foreignKey: 'available_event_id',
  });
  FeedBack.belongsTo(AvailableEvents, {
    foreignKey: 'available_event_id',
  });
  
  Lands.hasMany(FeedBack, {
    foreignKey: 'land_id',
  });
  
  FeedBack.belongsTo(Lands, {
    foreignKey: 'land_id',
  });
  
  module.exports = FeedBack;
  