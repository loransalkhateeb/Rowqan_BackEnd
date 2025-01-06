const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');


const Blog = sequelize.define('Blog', {
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
    tableName: 'Blog' 
});

module.exports = Blog;