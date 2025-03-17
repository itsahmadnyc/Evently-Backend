const express = require('express');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());


app.use('/api', userRoutes);


(async () => {
  try {
    await sequelize.sync({ force: false }); 
    console.log('✅ Database synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
})();
