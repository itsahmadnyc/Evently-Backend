const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/resend-otp', authController.resendOTP);
router.get('/me', authenticate, authController.getUser);
router.put('/update-profile', authenticate, authController.updateProfile);
router.post('/deactivate', authenticate, authController.deactivateUser);

// Admin Routes
router.get('/users', authenticate, isAdmin, authController.getAllUsers);
router.post('/restore/:id', authenticate, isAdmin, authController.restoreUser);

module.exports = router;
