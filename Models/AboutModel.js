const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');


const About = sequelize.define('About', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT, 
        allowNull: true
    },
    image: {
        type: DataTypes.STRING, 
        allowNull: false, 
      },
      lang: {
        type: DataTypes.STRING, 
        allowNull: false, 
      },
}, {
    timestamps: false, 
    tableName: 'About' 
});

module.exports = About;