const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const { sendResponse, handleError, getPaginationParams } = require('../utils/helpers');

const getResumeId = (req) => req.params.resumeId || req.params.id;

// Upload and parse resume
exports.uploadResume = async (req, res) => {
  try {
    const body = req.body || {};
    const uploadedFile = req.file;
    const extractedData = body.extractedData || {};
    let parsedData = {};

    if (typeof extractedData === 'string' && extractedData.trim()) {
      parsedData = JSON.parse(extractedData);
    } else if (extractedData && typeof extractedData === 'object') {
      parsedData = extractedData;
    }

    if (uploadedFile && Object.keys(parsedData).length === 0) {
      try {
        const aiExtraction = await aiService.extractResumeFromFile(uploadedFile);
        parsedData = aiExtraction?.extracted_data || {};
        if (!parsedData.skills?.length && aiExtraction?.skills?.length) {
          parsedData.skills = aiExtraction.skills.map((skill) => ({ name: skill }));
        }
        parsedData.rawText = aiExtraction?.text;
      } catch (error) {
        console.warn('Python resume extraction failed:', error.message);
      }
    }

    const fallbackData = {
      personalInfo: {},
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: [],
      extractionQuality: uploadedFile ? 50 : 80,
    };

    const resumeData = { ...fallbackData, ...parsedData };

    const resume = new Resume({
      userId: req.user.userId,
      fileName: body.fileName || uploadedFile?.originalname || 'resume.pdf',
      fileUrl: body.fileUrl,
      fileSize: uploadedFile?.size,
      personalInfo: resumeData.personalInfo || {},
      summary: resumeData.summary,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills,
      certifications: resumeData.certifications,
      projects: resumeData.projects,
      languages: resumeData.languages,
      aiAnalysis: {
        extractedAt: new Date(),
        extractionQuality: resumeData.extractionQuality,
        rawText: resumeData.rawText,
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
      skills: resume.skills.map((skill) => skill.name || skill),
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
      _id: getResumeId(req),
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
      { _id: getResumeId(req), userId: req.user.userId },
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
      { _id: getResumeId(req), userId: req.user.userId },
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
      _id: getResumeId(req),
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
