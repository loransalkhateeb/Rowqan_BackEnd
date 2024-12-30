const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql',
    logging: false, 
    dialectOptions: {
      connectTimeout: 50000, 
      ssl: {
        rejectUnauthorized: true, 
      },
    },
    pool: {
      max: 50, 
      min: 5, 
      acquire: 20000, 
      idle: 5000, 
      evict: 1000, 
    },
    define: {
      timestamps: false, 
    },
    benchmark: true, 
  }
);


const testConnection = async () => {
  try {
    const startTime = Date.now(); 
    await sequelize.authenticate(); 
    const duration = Date.now() - startTime;
    console.log(`Connection pool established successfully in ${duration}ms.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
};


testConnection();


process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await sequelize.close();
  process.exit(0);
});

module.exports = sequelize;
