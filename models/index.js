const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); 

const User = require("./User")
const Category = require("./Category")
const Event = require("./Event")
const Venue = require("./Venue")

Category.hasMany(Event, {foreignKey:"categoryId", as: "event"})
Event.belongsTo(Category, {foreignKey: "categoryId", as: "event"})





module.exports = {sequelize, User, Category, Event, Venue}