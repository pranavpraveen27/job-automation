const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse, handleError } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId, id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return sendResponse(res, 400, false, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, 'User already exists');
    }

    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    return sendResponse(res, 201, true, 'User created successfully', {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { email, fullName, picture, googleId } = req.body;

    if (!email || !googleId) {
      return sendResponse(res, 400, false, 'Email and googleId are required');
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        fullName: fullName || email,
        googleId,
        avatar: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    return sendResponse(res, 200, true, 'Google authentication successful', {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('currentResume');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved', {
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, location, linkedinUrl, githubUrl, portfolioUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName: fullName || undefined,
        phone: phone || undefined,
        location: location || undefined,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        portfolioUrl: portfolioUrl || undefined,
      },
      { new: true, runValidators: true }
    );

    return sendResponse(res, 200, true, 'Profile updated successfully', {
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update job preferences
exports.updateJobPreferences = async (req, res) => {
  try {
    const { industries, jobTitles, locations, salaryMin, salaryMax, employmentTypes } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        jobPreferences: {
          industries: industries || [],
          jobTitles: jobTitles || [],
          locations: locations || [],
          salaryMin,
          salaryMax,
          employmentTypes: employmentTypes || [],
        },
      },
      { new: true }
    );

    return sendResponse(res, 200, true, 'Preferences updated', {
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Update AI settings
exports.updateAISettings = async (req, res) => {
  try {
    const { autoGenCoverLetter, autoFillForms, matchScoreThreshold } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        aiSettings: {
          autoGenCoverLetter: autoGenCoverLetter !== undefined ? autoGenCoverLetter : true,
          autoFillForms: autoFillForms !== undefined ? autoFillForms : true,
          matchScoreThreshold: matchScoreThreshold || 70,
        },
      },
      { new: true }
    );

    return sendResponse(res, 200, true, 'AI settings updated', {
      user: user.toJSON(),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Logout
exports.logout = (req, res) => {
  return sendResponse(res, 200, true, 'Logged out successfully');
};
