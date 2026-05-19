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
router.get('/stats/overview', applicationController.getApplicationStats);
router.post('/generate-cover-letter', applicationController.generateCoverLetter);
router.post('/export-cover-letter-pdf', pdfExportController.exportCoverLetterPDF);
router.get('/:id', applicationController.getApplication);
router.put('/:id', applicationController.updateApplicationStatus);
router.delete('/:id', applicationController.deleteApplication);

// Application actions
router.post('/:id/interview', applicationController.scheduleInterview);
router.post('/:jobId/auto-apply', applicationController.autoApplyToJob);

// PDF Export endpoints
router.get('/:applicationId/download-cover-letter', pdfExportController.downloadCoverLetterPDF);

module.exports = router;
