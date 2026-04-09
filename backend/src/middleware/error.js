export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  // Don't expose database error details to client
  let message = 'Internal server error';
  if (status === 400) {
    message = err.message || 'Bad request';
  } else if (status === 401) {
    message = err.message || 'Unauthorized';
  } else if (status === 403) {
    message = err.message || 'Forbidden';
  } else if (status === 404) {
    message = err.message || 'Not found';
  } else if (status === 409) {
    message = err.message || 'Conflict';
  } else if (status >= 500) {
    // For 5xx errors, don't expose internal details in production
    if (process.env.NODE_ENV === 'development') {
      message = err.message;
    }
  }
  res.status(status).json({ success: false, message });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
