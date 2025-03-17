const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); 

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access Denied. Token missing.' });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); 

    
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Access denied. User not active or does not exist.' });
    }

    
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token. Please provide a valid token." });
    } else {
      return res.status(401).json({ error: "Authentication failed." });
    }
  }
};


exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};
