const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/preferences', authenticateToken, authController.updateJobPreferences);
router.put('/ai-settings', authenticateToken, authController.updateAISettings);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
