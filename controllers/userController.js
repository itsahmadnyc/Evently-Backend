const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const sendEmail = require('../helpers/sendEmail');
require('dotenv').config();


const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { phoneNumber }] } } );
    if (existingUser) return res.status(400).json({ error: 'Email or Phone Number already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); 
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({ 
      name, 
      email, 
      phoneNumber, 
      password: hashedPassword, 
      role: 'user', 
      isActive: true, 
      isVerified: false, 
      otp, 
      otpExpires 
    });

    try {
      await sendEmail(email, 'Your OTP for Verification', `Your OTP is: ${otp}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // Hard delete the user
      await user.destroy({ force: true });

      return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }

    res.status(201).json({ message: 'User registered successfully. Please verify your OTP.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail(email, 'Resend OTP for Verification', `Your OTP is: ${otp}`);

      return res.status(403).json({ error: 'Please verify your email. A new OTP has been sent.' });
    }

    if (!user.isActive) return res.status(403).json({ error: 'Your account is deactivated. Contact admin for assistance.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    user.lastLogin = new Date();
    await user.save();

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, 'Resend OTP for Verification', `Your OTP is: ${otp}`);

    res.json({ message: 'OTP resent successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({user: user});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User account deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params; 

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User account restored', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
