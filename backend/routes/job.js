const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All job routes require authentication
router.use(authenticateToken);

// Job CRUD operations
router.post('/', jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:jobId', jobController.getJob);
router.put('/:jobId', jobController.updateJob);
router.delete('/:jobId', jobController.deleteJob);

// Job analysis and actions
router.post('/:jobId/analyze', jobController.analyzeJobMatch);

module.exports = router;
