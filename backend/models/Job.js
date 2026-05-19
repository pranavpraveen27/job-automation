const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Job Information
    externalJobId: String, // ID from job portal
    jobPortal: {
      type: String,
      enum: ['linkedin', 'indeed', 'glassdoor', 'buildin', 'wellfound', 'custom'],
      required: true,
    },
    
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    industry: String,
    
    // Location & Type
    location: String,
    locationType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
    },
    
    // Job Details
    description: String,
    requirements: [String],
    preferredQualifications: [String],
    responsibilities: [String],
    
    // Compensation
    salary: {
      min: Number,
      max: Number,
      currency: String,
      period: String, // yearly, monthly, hourly
    },
    
    benefits: [String],
    equity: String,
    
    // Metadata
    seniority: {
      type: String,
      enum: ['entry-level', 'mid-level', 'senior', 'lead', 'executive'],
    },
    experienceRequired: Number, // in years
    
    skills: [String],
    technologies: [String],
    
    // Job Posting Details
    postedDate: Date,
    deadline: Date,
    company_logo: String,
    company_website: String,
    
    // Job URL
    jobUrl: String,
    
    // Matching & Analysis
    aiAnalysis: {
      matchScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      matchReasons: [String],
      missingSkills: [String],
      candidateSuitability: String,
      recommendationReason: String,
      analyzedAt: Date,
    },
    
    // Application Status
    applicationStatus: {
      type: String,
      enum: ['pending', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    
    // Tracking
    savedAt: Date,
    appliedAt: Date,
    sourceUrl: String,
    autoApplied: Boolean,
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, applicationStatus: 1 });

module.exports = mongoose.model('Job', jobSchema);
