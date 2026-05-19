const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const { sendResponse, handleError } = require('../utils/helpers');

// Analyze resume and get AI insights
exports.getResumeInsights = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Fetch resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    // Format resume text from structured data
    const resumeText = formatResumeText(resume);

    // Get AI suggestions for improvements
    const insights = await aiService.suggestResumeImprovements(resumeText);

    // Store insights in resume
    resume.aiAnalysis = resume.aiAnalysis || {};
    resume.aiAnalysis.insights = insights;
    resume.aiAnalysis.insightsGeneratedAt = new Date();
    await resume.save();

    return sendResponse(res, 200, true, 'Resume insights generated', { insights });
  } catch (error) {
    return handleError(res, error);
  }
};

// Generate resume critique focusing on formatting and impact
exports.critiquesResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Fetch resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    // Format resume text
    const resumeText = formatResumeText(resume);

    // Get AI critique on formatting and text impact
    const critique = await aiService.critiqueResumeFormatting(resumeText);

    // Store critique
    resume.aiAnalysis = resume.aiAnalysis || {};
    resume.aiAnalysis.critique = critique;
    resume.aiAnalysis.critiqueGeneratedAt = new Date();
    await resume.save();

    return sendResponse(res, 200, true, 'Resume critique generated', { critique });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get resume score based on format and content
exports.getResumeScore = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    const resumeText = formatResumeText(resume);
    const analysis = await aiService.analyzeResumeQuality(resumeText);

    return sendResponse(res, 200, true, 'Resume analysis complete', { analysis });
  } catch (error) {
    return handleError(res, error);
  }
};

// Helper: Format resume data into readable text
function formatResumeText(resume) {
  let text = '';

  // Personal Info
  if (resume.personalInfo) {
    text += `${resume.personalInfo.fullName}\n`;
    if (resume.personalInfo.email) text += `Email: ${resume.personalInfo.email}\n`;
    if (resume.personalInfo.phone) text += `Phone: ${resume.personalInfo.phone}\n`;
    if (resume.personalInfo.location) text += `Location: ${resume.personalInfo.location}\n`;
    text += '\n';
  }

  // Summary
  if (resume.summary) {
    text += `PROFESSIONAL SUMMARY\n${resume.summary}\n\n`;
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    text += 'PROFESSIONAL EXPERIENCE\n';
    resume.experience.forEach((exp) => {
      text += `${exp.position} at ${exp.company}\n`;
      if (exp.duration) text += `${exp.duration}\n`;
      if (exp.description) text += `${exp.description}\n`;
      if (exp.highlights && exp.highlights.length > 0) {
        text += `Highlights: ${exp.highlights.join(', ')}\n`;
      }
      text += '\n';
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    text += 'EDUCATION\n';
    resume.education.forEach((edu) => {
      text += `${edu.degree} in ${edu.field} from ${edu.institution}\n`;
      if (edu.graduationDate) text += `Graduated: ${edu.graduationDate}\n`;
      text += '\n';
    });
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    text += 'SKILLS\n';
    resume.skills.forEach((skill) => {
      text += `• ${skill.name}`;
      if (skill.proficiency) text += ` (${skill.proficiency})`;
      if (skill.years) text += ` - ${skill.years} years`;
      text += '\n';
    });
    text += '\n';
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    text += 'CERTIFICATIONS\n';
    resume.certifications.forEach((cert) => {
      text += `• ${cert.name}`;
      if (cert.issuer) text += ` from ${cert.issuer}`;
      text += '\n';
    });
    text += '\n';
  }

  return text;
}

module.exports = {
  getResumeInsights,
  critiquesResume,
  getResumeScore,
};
