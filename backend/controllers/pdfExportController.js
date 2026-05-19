const Application = require('../models/Application');
const Resume = require('../models/Resume');
const pdfGenerationService = require('../services/pdfGenerationService');
const { sendResponse, handleError } = require('../utils/helpers');

// Download cover letter as PDF
exports.downloadCoverLetterPDF = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Get application with user authorization
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user.userId,
    }).populate('userId');

    if (!application || !application.coverLetter || !application.coverLetter.text) {
      return sendResponse(res, 404, false, 'Cover letter not found');
    }

    // Prepare cover letter data
    const coverLetterData = {
      text: application.coverLetter.text,
      candidateName: application.userId.fullName,
      candidateEmail: application.userId.email,
      candidatePhone: application.userId.phone,
      jobTitle: application.jobTitle,
      company: application.company,
    };

    // Generate PDF
    const pdfBuffer = await pdfGenerationService.generateCoverLetterPDF(coverLetterData);

    // Set response headers for file download
    const filename = `${application.company}_CoverLetter_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    return handleError(res, error);
  }
};

// Download resume as PDF
exports.downloadResumePDF = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Get resume with user authorization
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    // Generate PDF from resume data
    const pdfBuffer = await pdfGenerationService.generateResumePDF(resume.toObject());

    // Set response headers for file download
    const filename = `Resume_${resume.personalInfo?.fullName || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating resume PDF:', error);
    return handleError(res, error);
  }
};

// Export cover letter as PDF (alternative endpoint for batch/multiple)
exports.exportCoverLetterPDF = async (req, res) => {
  try {
    const { applicationId, format } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user.userId,
    }).populate('userId');

    if (!application || !application.coverLetter || !application.coverLetter.text) {
      return sendResponse(res, 404, false, 'Cover letter not found');
    }

    const coverLetterData = {
      text: application.coverLetter.text,
      candidateName: application.userId.fullName,
      candidateEmail: application.userId.email,
      candidatePhone: application.userId.phone,
      jobTitle: application.jobTitle,
      company: application.company,
    };

    const pdfBuffer = await pdfGenerationService.generateCoverLetterPDF(coverLetterData);

    // Return buffer in response for client download
    return sendResponse(res, 200, true, 'PDF generated successfully', {
      pdf: pdfBuffer.toString('base64'),
      filename: `${application.company}_CoverLetter.pdf`,
      mimeType: 'application/pdf',
    });
  } catch (error) {
    console.error('Error exporting cover letter PDF:', error);
    return handleError(res, error);
  }
};

module.exports = {
  downloadCoverLetterPDF,
  downloadResumePDF,
  exportCoverLetterPDF,
};
