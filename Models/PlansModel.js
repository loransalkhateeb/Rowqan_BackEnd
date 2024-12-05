const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Available_Events = require('../Models/AvailableEvents')

const Plans = sequelize.define('Plans', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plane_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description_plan: {
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


Available_Events.hasMany(Plans, { foreignKey: 'Avialable_Event_Id' });
Plans.belongsTo(Available_Events, { foreignKey: 'Avialable_Event_Id' });




module.exports = Plans;
