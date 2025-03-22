const express = require('express');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const http = require("http");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.use('/api', userRoutes);

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address; 
      }
    }
  }
  return "localhost"; 
};
const localIP = getLocalIP();


(async () => {
  try {
    await sequelize.sync({ force: false, alter: true }); 
    console.log('✅ Database synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://${localIP}:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
})();
