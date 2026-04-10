const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    screenshotPath: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
