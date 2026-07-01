const { APIError } = require('./errorMiddleware');
const logger = require('../utils/logger');

const MIN_SUBMIT_TIME_MS = 2000;
const MAX_FORM_AGE_MS = 30 * 60 * 1000;

const verifyHumanCheck = (req, res, next) => {
  const { isHuman, formLoadedAt, website } = req.body;

  if (website && String(website).trim() !== '') {
    logger.warn(`Bot blocked (honeypot) — IP: ${req.ip}, path: ${req.path}`);
    return next(new APIError('Verification failed. Please try again.', 403));
  }

  if (isHuman !== true) {
    return next(new APIError('Please confirm you are human before continuing.', 403));
  }

  const loadedAt = Number(formLoadedAt);
  if (!Number.isFinite(loadedAt)) {
    logger.warn(`Bot blocked (missing timestamp) — IP: ${req.ip}, path: ${req.path}`);
    return next(new APIError('Verification failed. Please try again.', 403));
  }

  const elapsed = Date.now() - loadedAt;

  if (elapsed < MIN_SUBMIT_TIME_MS) {
    logger.warn(`Bot blocked (too fast: ${elapsed}ms) — IP: ${req.ip}, path: ${req.path}`);
    return next(new APIError('Verification failed. Please try again.', 403));
  }

  if (elapsed > MAX_FORM_AGE_MS) {
    return next(new APIError('Form expired. Please refresh the page and try again.', 403));
  }

  next();
};

module.exports = { verifyHumanCheck };
