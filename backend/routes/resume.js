const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const resumeOptimizationController = require('../controllers/resumeOptimizationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All resume routes require authentication
router.use(authenticateToken);

// Resume CRUD operations
router.post('/', resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:resumeId', resumeController.getResume);
router.put('/:resumeId', resumeController.updateResume);
router.delete('/:resumeId', resumeController.deleteResume);

// Resume management
router.put('/:resumeId/set-default', resumeController.setDefaultResume);

// Resume optimization and AI analysis
router.get('/:resumeId/insights', resumeOptimizationController.getResumeInsights);
router.get('/:resumeId/critique', resumeOptimizationController.critiquesResume);
router.get('/:resumeId/score', resumeOptimizationController.getResumeScore);

module.exports = router;
