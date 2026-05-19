const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const pdfExportController = require('../controllers/pdfExportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All application routes require authentication
router.use(authenticateToken);

// Application CRUD operations
router.post('/', applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplication);
router.put('/:id', applicationController.updateApplicationStatus);
router.delete('/:id', applicationController.deleteApplication);

// Application actions
router.post('/:id/interview', applicationController.scheduleInterview);
router.post('/:jobId/auto-apply', applicationController.autoApplyToJob);
router.get('/stats/overview', applicationController.getApplicationStats);

// PDF Export endpoints
router.get('/:applicationId/download-cover-letter', pdfExportController.downloadCoverLetterPDF);
router.post('/export-cover-letter-pdf', pdfExportController.exportCoverLetterPDF);

module.exports = router;
