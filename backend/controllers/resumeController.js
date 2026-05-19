const Resume = require('../models/Resume');
const { sendResponse, handleError, getPaginationParams } = require('../utils/helpers');

// Upload and parse resume
exports.uploadResume = async (req, res) => {
  try {
    const { fileName, fileUrl, extractedData } = req.body;

    const resume = new Resume({
      userId: req.user.userId,
      fileName,
      fileUrl,
      personalInfo: extractedData.personalInfo,
      summary: extractedData.summary,
      experience: extractedData.experience,
      education: extractedData.education,
      skills: extractedData.skills,
      certifications: extractedData.certifications,
      projects: extractedData.projects,
      languages: extractedData.languages,
      aiAnalysis: {
        extractedAt: new Date(),
        extractionQuality: extractedData.extractionQuality || 80,
      },
    });

    await resume.save();

    // Set as default if first resume
    const existingDefault = await Resume.findOne({
      userId: req.user.userId,
      isDefault: true,
    });

    if (!existingDefault) {
      resume.isDefault = true;
      await resume.save();
    }

    return sendResponse(res, 201, true, 'Resume uploaded successfully', {
      resume,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all resumes
exports.getResumes = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const total = await Resume.countDocuments({ userId: req.user.userId });
    const resumes = await Resume.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendResponse(res, 200, true, 'Resumes retrieved', { resumes }, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get resume by ID
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    return sendResponse(res, 200, true, 'Resume retrieved', { resume });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update resume
exports.updateResume = async (req, res) => {
  try {
    const { personalInfo, summary, skills, experience, education } = req.body;

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        personalInfo: personalInfo || undefined,
        summary: summary || undefined,
        skills: skills || undefined,
        experience: experience || undefined,
        education: education || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    return sendResponse(res, 200, true, 'Resume updated', { resume });
  } catch (error) {
    return handleError(res, error);
  }
};

// Set as default resume
exports.setDefaultResume = async (req, res) => {
  try {
    // Remove default from all resumes
    await Resume.updateMany(
      { userId: req.user.userId },
      { isDefault: false }
    );

    // Set selected as default
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isDefault: true },
      { new: true }
    );

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    return sendResponse(res, 200, true, 'Default resume set', { resume });
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!resume) {
      return sendResponse(res, 404, false, 'Resume not found');
    }

    return sendResponse(res, 200, true, 'Resume deleted');
  } catch (error) {
    return handleError(res, error);
  }
};
