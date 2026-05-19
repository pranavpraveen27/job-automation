const Job = require('../models/Job');
const aiService = require('../services/aiService');
const { sendResponse, handleError, getPaginationParams } = require('../utils/helpers');

// Create/Save job
exports.createJob = async (req, res) => {
  try {
    const {
      jobPortal,
      title,
      company,
      location,
      locationType,
      employmentType,
      description,
      requirements,
      skills,
      salary,
      jobUrl,
    } = req.body;

    const job = new Job({
      userId: req.user.userId,
      jobPortal,
      title,
      company,
      location,
      locationType,
      employmentType,
      description,
      requirements: requirements || [],
      skills: skills || [],
      salary: salary || {},
      jobUrl,
      savedAt: new Date(),
    });

    await job.save();

    return sendResponse(res, 201, true, 'Job saved successfully', { job });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, portal } = req.query;

    const filter = { userId: req.user.userId };
    if (status) filter.applicationStatus = status;
    if (portal) filter.jobPortal = portal;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendResponse(res, 200, true, 'Jobs retrieved', { jobs }, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get job by ID
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    return sendResponse(res, 200, true, 'Job retrieved', { job });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { applicationStatus, notes, tags, priority } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        applicationStatus: applicationStatus || undefined,
        notes: notes || undefined,
        tags: tags || undefined,
        priority: priority || undefined,
      },
      { new: true }
    );

    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    return sendResponse(res, 200, true, 'Job updated', { job });
  } catch (error) {
    return handleError(res, error);
  }
};

// Analyze job match
exports.analyzeJobMatch = async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user.userId,
    });

    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    const analysis = await aiService.analyzeResumeJobMatch(
      resumeText,
      job.description
    );

    job.aiAnalysis = {
      matchScore: analysis.matchScore || 0,
      matchReasons: analysis.matchingSkills || [],
      missingSkills: analysis.missingSkills || [],
      candidateSuitability: analysis.assessment || '',
      analyzedAt: new Date(),
    };

    await job.save();

    return sendResponse(res, 200, true, 'Job analyzed', { job });
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    return sendResponse(res, 200, true, 'Job deleted');
  } catch (error) {
    return handleError(res, error);
  }
};
