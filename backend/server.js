require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Job = require('./models/Job');
const { processJob } = require('./automation');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/job-agent';

app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.post('/apply', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Job URL is required' });
  }

  try {
    const job = new Job({ url, status: 'pending' });
    await job.save();

    processJob(job._id)
      .then(() => console.log(`Started automation for job ${job._id}`))
      .catch((error) => console.error('Automation error:', error));

    return res.json({ message: 'Job created', jobId: job._id });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
});

app.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    service: 'Autonomous Job Application Agent',
    time: new Date().toISOString(),
  });
});

app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    const response = jobs.map((job) => {
      const jobObject = job.toObject();
      if (jobObject.screenshotPath) {
        jobObject.screenshotUrl = `${req.protocol}://${req.get('host')}/screenshots/${path.basename(jobObject.screenshotPath)}`;
      }
      return jobObject;
    });
    return res.json(response);
  } catch (error) {
    console.error('Error loading jobs:', error);
    return res.status(500).json({ error: 'Failed to load jobs' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
