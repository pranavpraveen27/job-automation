const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const playwrightService = require('../services/playwrightService');
const { sendResponse, handleError, getPaginationParams } = require('../utils/helpers');

exports.generateCoverLetter = async (req, res) => {
  try {
    const {
      candidate_name,
      candidate_summary,
      skills = [],
      job_title,
      company_name,
      company_description,
      resume_id,
      job_id,
    } = req.body;

    const [resume, job] = await Promise.all([
      resume_id ? Resume.findOne({ _id: resume_id, userId: req.user.userId }) : null,
      job_id ? Job.findOne({ _id: job_id, userId: req.user.userId }) : null,
    ]);

    const resumeSkills = resume?.skills?.map((skill) => skill.name || skill).filter(Boolean) || [];
    const coverLetter = await aiService.generateCoverLetter(
      {
        fullName: candidate_name || resume?.personalInfo?.fullName || 'Candidate',
        email: req.user?.email || '',
        experience: resume?.aiAnalysis?.rawText || resume?.summary || candidate_summary || '',
        skills: resumeSkills.length ? resumeSkills : skills,
      },
      {
        title: job?.title || job_title || 'the role',
        company: job?.company || company_name || 'your company',
        description: job?.description || company_description || '',
        requirements: job?.requirements?.length ? job.requirements : skills,
      }
    );

    return sendResponse(res, 200, true, 'Cover letter generated', {
      cover_letter: coverLetter,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Create application
exports.createApplication = async (req, res) => {
  try {
    const { jobId, resumeId, coverLetter, autoApplied } = req.body;

    const job = await Job.findOne({ _id: jobId, userId: req.user.userId });
    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    const resume = resumeId
      ? await Resume.findOne({ _id: resumeId, userId: req.user.userId })
      : null;
    let finalCoverLetter = coverLetter;

    if (!finalCoverLetter && resume) {
      const resumeSkills = resume.skills?.map((skill) => skill.name || skill).filter(Boolean) || [];
      finalCoverLetter = await aiService.generateCoverLetter(
        {
          fullName: resume.personalInfo?.fullName || req.user?.fullName || 'Candidate',
          email: req.user?.email || '',
          experience: resume.aiAnalysis?.rawText || resume.summary || '',
          skills: resumeSkills,
        },
        {
          title: job.title,
          company: job.company,
          description: job.description || '',
          requirements: job.requirements?.length ? job.requirements : job.skills || [],
        }
      );
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
        text: finalCoverLetter,
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
    const { resumeId, coverLetter } = req.body;
    const jobId = req.params.jobId || req.body.jobId;

    const job = await Job.findOne({ _id: jobId, userId: req.user.userId });
    if (!job) {
      return sendResponse(res, 404, false, 'Job not found');
    }

    if (!job.jobUrl) {
      return sendResponse(res, 400, false, 'Job URL is required for Playwright auto-apply');
    }

    const resume = resumeId
      ? await Resume.findOne({ _id: resumeId, userId: req.user.userId })
      : await Resume.findOne({ userId: req.user.userId, isDefault: true });

    const resumeText = resume?.aiAnalysis?.rawText || resume?.summary || '';
    const jobDescription = [
      job.title,
      job.company,
      job.description,
      job.requirements?.join(', '),
      job.skills?.join(', '),
    ].filter(Boolean).join('\n');

    let finalCoverLetter = coverLetter;
    if (!finalCoverLetter && resume) {
      const resumeSkills = resume.skills?.map((skill) => skill.name || skill).filter(Boolean) || [];
      finalCoverLetter = await aiService.generateCoverLetter(
        {
          fullName: resume.personalInfo?.fullName || 'Candidate',
          email: req.user?.email || '',
          experience: resumeText,
          skills: resumeSkills,
        },
        {
          title: job.title,
          company: job.company,
          description: job.description || '',
          requirements: job.requirements?.length ? job.requirements : job.skills || [],
        }
      );
    }

    const generatedFields = await aiService.generateApplicationFields(
      resumeText,
      jobDescription,
      finalCoverLetter || ''
    );
    const fullName = resume?.personalInfo?.fullName || req.user?.fullName || '';
    const applicationData = {
      fullName,
      name: fullName,
      email: resume?.personalInfo?.email || req.user?.email || '',
      phone: resume?.personalInfo?.phone || '',
      location: resume?.personalInfo?.location || '',
      linkedin: resume?.personalInfo?.linkedinUrl || '',
      github: resume?.personalInfo?.githubUrl || '',
      portfolio: resume?.personalInfo?.portfolioUrl || '',
      summary: resume?.summary || '',
      coverLetter: finalCoverLetter || '',
      ...generatedFields,
    };

    // Check job portal and apply
    let page = null;
    try {
      page = await playwrightService.createPage();

      let result;
      if (job.jobPortal === 'linkedin') {
        result = await playwrightService.applyToLinkedInJob(page, job.jobUrl, applicationData);
      } else if (job.jobPortal === 'indeed') {
        result = await playwrightService.applyToIndeedJob(page, job.jobUrl, applicationData);
      } else {
        throw new Error(`Unsupported job portal: ${job.jobPortal}`);
      }

      // Create application record
      const application = new Application({
        userId: req.user.userId,
        jobId,
        resumeId: resume?._id,
        jobTitle: job.title,
        company: job.company,
        jobUrl: job.jobUrl,
        status: 'submitted',
        coverLetter: {
          text: finalCoverLetter,
          generatedAt: new Date(),
          model: 'groq',
        },
        formResponses: {
          responses: Object.entries(applicationData).map(([fieldName, fieldValue]) => ({
            fieldName,
            fieldValue: String(fieldValue ?? ''),
            fieldType: 'text',
          })),
          autoFilled: true,
          filledAt: new Date(),
        },
        autoApplied: true,
        applicationMethod: 'auto',
        automationDetails: {
          executedAt: new Date(),
          completedAt: new Date(),
          success: true,
          playwrightSessionId: result?.sessionId,
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
        applicationStatus: 'pending',
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
      { $match: { userId: new (require('mongoose').Types.ObjectId)(req.user.userId) } },
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
