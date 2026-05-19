// Pagination helper
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Response formatter
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
  };
  
  if (data) response.data = data;
  if (meta) response.meta = meta;
  
  return res.status(statusCode).json(response);
};

// Error handler
const handleError = (res, error, statusCode = 500) => {
  const message = error.message || 'Internal server error';
  const errorResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  };
  
  return res.status(statusCode).json(errorResponse);
};

module.exports = {
  getPaginationParams,
  sendResponse,
  handleError,
};
