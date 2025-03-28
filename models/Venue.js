const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 rating: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalEvents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
 
  
}, {
  timestamps: true,
  paranoid: true, 
});

module.exports = Venue;
