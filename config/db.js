const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false, 
  }
);


(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL successfully.');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
  }
})();

module.exports = sequelize;
