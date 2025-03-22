const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
  logging: false, 
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
  }
})();

module.exports = sequelize;
