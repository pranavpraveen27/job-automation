const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // File Information
    fileName: String,
    fileUrl: String,
    filePath: String,
    fileSize: Number,
    
    // Extracted Data
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedinUrl: String,
      githubUrl: String,
      portfolioUrl: String,
    },
    
    // Extracted Sections
    summary: String,
    
    experience: [
      {
        company: String,
        position: String,
        duration: String,
        startDate: Date,
        endDate: Date,
        currentlyWorking: Boolean,
        description: String,
        highlights: [String],
      },
    ],
    
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        graduationDate: Date,
        gpa: String,
        honors: String,
      },
    ],
    
    skills: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        years: Number,
      },
    ],
    
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expirationDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
    
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        link: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    
    languages: [
      {
        language: String,
        proficiency: String,
      },
    ],
    
    // AI Analysis
    aiAnalysis: {
      extractedAt: Date,
      extractionQuality: Number, // 0-100
      rawText: String,
      totalScore: Number,
      keywordMatches: [String],
      suggestedImprovements: [String],
    },
    
    // Metadata
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
