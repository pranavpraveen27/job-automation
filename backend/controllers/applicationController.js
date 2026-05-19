const Application = require('../models/Application');
const Job = require('../models/Job');
const aiService = require('../services/aiService');
const playwrightService = require('../services/playwrightService');
const { sendResponse, handleError, getPaginationParams } = require('../utils/helpers');

// Create application
exports.createApplication = async (req, res) => {
  try {
    const { jobId, resumeId, coverLetter, autoApplied } = req.body;

    const job = await Job.findOne({ _id: jobId, userId: req.user.userId });
    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    const application = new Application({
      userId: req.user.userId,
      jobId,
      resumeId,
      jobTitle: job.title,
      company: job.company,
      jobUrl: job.jobUrl,
      status: 'submitted',
      coverLetter: {
        text: coverLetter,
        generatedAt: new Date(),
      },
      autoApplied: autoApplied || false,
      applicationMethod: autoApplied ? 'auto' : 'manual',
    });

    await application.save();

    // Update job status
    job.applicationStatus = 'applied';
    job.appliedAt = new Date();
    await job.save();

    return sendResponse(res, 201, true, 'Application created', { application });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all applications
exports.getApplications = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const filter = { userId: req.user.userId };
    if (status) filter.status = status;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('jobId', 'title company location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendResponse(res, 200, true, 'Applications retrieved', { applications }, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get application by ID
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate('jobId resumeId');

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    return sendResponse(res, 200, true, 'Application retrieved', { application });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        status,
        $push: {
          statusHistory: {
            status,
            date: new Date(),
            notes,
          },
        },
      },
      { new: true }
    );

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    return sendResponse(res, 200, true, 'Application updated', { application });
  } catch (error) {
    return handleError(res, error);
  }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { date, time, type, interviewer } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        interviewScheduled: true,
        $push: {
          interviews: {
            date,
            time,
            type,
            interviewer,
            result: 'pending',
          },
        },
      },
      { new: true }
    );

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    return sendResponse(res, 200, true, 'Interview scheduled', { application });
  } catch (error) {
    return handleError(res, error);
  }
};

// Auto-apply to job using Playwright
exports.autoApplyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findOne({ _id: jobId, userId: req.user.userId });
    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    // Check job portal and apply
    let page = null;
    try {
      page = await playwrightService.createPage();

      let result;
      if (job.jobPortal === 'linkedin') {
        result = await playwrightService.applyToLinkedInJob(page, job.jobUrl, {});
      } else if (job.jobPortal === 'indeed') {
        result = await playwrightService.applyToIndeedJob(page, job.jobUrl, {});
      } else {
        throw new Error(`Unsupported job portal: ${job.jobPortal}`);
      }

      // Create application record
      const application = new Application({
        userId: req.user.userId,
        jobId,
        status: 'submitted',
        autoApplied: true,
        applicationMethod: 'auto',
        automationDetails: {
          executedAt: new Date(),
          success: true,
        },
      });

      await application.save();

      // Update job status
      job.applicationStatus = 'applied';
      job.appliedAt = new Date();
      job.autoApplied = true;
      await job.save();

      return sendResponse(res, 201, true, 'Application submitted', { application });
    } finally {
      if (page) {
        await page.close();
      }
    }
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    // Update job status back to open
    if (application.jobId) {
      await Job.findByIdAndUpdate(application.jobId, {
        applicationStatus: 'open',
        appliedAt: null,
      });
    }

    return sendResponse(res, 200, true, 'Application deleted');
  } catch (error) {
    return handleError(res, error);
  }
};

// Get application stats
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0],
            },
          },
          screening: {
            $sum: {
              $cond: [{ $eq: ['$status', 'screening'] }, 1, 0],
            },
          },
          interview: {
            $sum: {
              $cond: [{ $eq: ['$status', 'interview'] }, 1, 0],
            },
          },
          offer: {
            $sum: {
              $cond: [{ $eq: ['$status', 'offer'] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
            },
          },
        },
      },
    ]);

    return sendResponse(res, 200, true, 'Stats retrieved', {
      stats: stats[0] || {},
    });
  } catch (error) {
    return handleError(res, error);
  }
};
