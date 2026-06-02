class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {{code?: string, details?: any}} [options]
   */
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

module.exports = { AppError };

