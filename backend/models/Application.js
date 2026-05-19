const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    
    // Application Details
    jobTitle: String,
    company: String,
    jobUrl: String,
    
    // Application Status
    status: {
      type: String,
      enum: ['submitted', 'viewed', 'screening', 'interview', 'rejected', 'offer', 'accepted', 'withdrawn'],
      default: 'submitted',
    },
    
    statusHistory: [
      {
        status: String,
        date: Date,
        notes: String,
      },
    ],
    
    // AI Generated Content
    coverLetter: {
      text: String,
      generatedAt: Date,
      model: String, // GPT-4, GPT-3.5, etc.
    },
    
    formResponses: {
      // Dynamic fields for different job portals
      responses: [
        {
          fieldName: String,
          fieldValue: String,
          fieldType: String,
        },
      ],
      autoFilled: Boolean,
      filledAt: Date,
    },
    
    // Application Process
    applicationMethod: {
      type: String,
      enum: ['manual', 'auto', 'quick-apply'],
    },
    
    autoApplied: {
      type: Boolean,
      default: false,
    },
    
    automationDetails: {
      playwrightSessionId: String,
      executedAt: Date,
      completedAt: Date,
      duration: Number, // in seconds
      success: Boolean,
      errorMessage: String,
      screenshots: [String],
    },
    
    // Communication
    communication: [
      {
        type: {
          type: String,
          enum: ['email', 'message', 'interview_request', 'rejection', 'offer'],
        },
        date: Date,
        subject: String,
        content: String,
        sender: String,
      },
    ],
    
    nextFollowUpDate: Date,
    followUpsSent: {
      type: Number,
      default: 0,
    },
    
    // Matching Score
    matchScore: Number,
    
    // Interview & Offer Tracking
    interviewScheduled: {
      type: Boolean,
      default: false,
    },
    
    interviews: [
      {
        date: Date,
        time: String,
        type: {
          type: String,
          enum: ['phone', 'video', 'in-person', 'group'],
        },
        interviewer: String,
        notes: String,
        feedback: String,
        result: {
          type: String,
          enum: ['pending', 'pass', 'fail', 'no-decision'],
        },
      },
    ],
    
    offerReceived: Boolean,
    offerDetails: {
      salaryOffered: Number,
      currency: String,
      benefits: [String],
      offerLetterUrl: String,
      acceptanceDeadline: Date,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'negotiating'],
      },
    },
    
    // Tags & Notes
    tags: [String],
    notes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ jobId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
