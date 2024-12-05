const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  'u670406748_rowqan',  
  'u670406748_rowqan',  
  'Rowqan111',  
  {
    host: '193.203.184.65',  
    dialect: 'mysql',  
    logging: false,  
  }
);





const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;