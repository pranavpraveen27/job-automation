const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: String,
    
    // Profile Information
    phone: String,
    location: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    
    // Resume Reference
    currentResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    
    // Automation Settings
    automationEnabled: {
      type: Boolean,
      default: true,
    },
    jobPreferences: {
      industries: [String],
      jobTitles: [String],
      locations: [String],
      salaryMin: Number,
      salaryMax: Number,
      employmentTypes: [String], // Full-time, Part-time, Contract, etc.
    },
    
    // AI Settings
    aiSettings: {
      autoGenCoverLetter: {
        type: Boolean,
        default: true,
      },
      autoFillForms: {
        type: Boolean,
        default: true,
      },
      matchScoreThreshold: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
    },
    
    // Statistics
    stats: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      successfulApplications: {
        type: Number,
        default: 0,
      },
      interviews: {
        type: Number,
        default: 0,
      },
      offers: {
        type: Number,
        default: 0,
      },
    },
    
    // Plan & Subscription
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionEndDate: Date,
    apiQuota: {
      monthlyLimit: Number,
      used: {
        type: Number,
        default: 0,
      },
      resetDate: Date,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Hide sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
