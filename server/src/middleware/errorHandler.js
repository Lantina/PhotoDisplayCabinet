const errorHandler = (err, _req, res, _next) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || '服务器内部错误',
  });
};

module.exports = errorHandler;

